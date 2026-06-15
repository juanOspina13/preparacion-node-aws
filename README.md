# Dashboard de Métricas Serverless

Aplicación full-stack de demostración que visualiza métricas de AWS. El backend está estructurado para despliegue en AWS Lambda; el frontend es una SPA con Vite + React.

---

## Estructura del repositorio

```
.
├── backend/          # Handlers AWS Lambda (TypeScript, empaquetado con tsup)
└── frontend/         # Dashboard React (Vite, Vitest)
```

---

## ¿Cómo se organiza un proyecto Node + TypeScript para una Lambda?

Esta es la pregunta central del backend. La respuesta tiene cuatro pilares: configuración de TypeScript, proceso de build, capa de handlers y estrategia de tests.

### 1. Configuración de TypeScript

El proyecto usa **dos archivos `tsconfig`** con responsabilidades distintas:

**`tsconfig.json`** — configuración de producción, solo para `src/`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "build",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "tests"]
}
```

- `target: ES2020` coincide con el runtime de Lambda (Node 20 soporta ES2020 completo).
- `module: commonjs` porque Lambda ejecuta CommonJS; los ESM dinámicos en Lambda todavía tienen fricciones con bundlers y layers.
- `strict: true` activa todas las comprobaciones estrictas (`noImplicitAny`, `strictNullChecks`, etc.). En código que se despliega en producción sin servidor de desarrollo que relance, los errores de tipo en build son la última línea de defensa.
- `declaration: true` genera archivos `.d.ts`, útiles si el backend se publica como paquete interno o se comparte entre lambdas con workspaces.

**`tsconfig.test.json`** — extiende el anterior y amplía `rootDir` para incluir `tests/`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": { "rootDir": "." },
  "include": ["src/**/*", "tests/**/*"]
}
```

Separar los tsconfig evita que los archivos de test contaminen el árbol de `src/` en el build de producción. `ts-jest` usa `tsconfig.test.json`; `tsup` usa `tsconfig.json`.

---

### 2. Build — tsup como empaquetador

`tsup` compila cada handler a un bundle CommonJS independiente y minificado:

```typescript
// tsup.config.ts
export default defineConfig({
  entry: ['src/handlers/*.ts'],   // un bundle por handler
  format: ['cjs'],
  target: 'node20',
  clean: true,
  minify: true,
  splitting: false,               // sin chunks compartidos entre handlers
  sourcemap: false,               // desactivados para reducir tamaño del zip
  outDir: 'build',
});
```

**Por qué un bundle por handler y no uno compartido:**

- Cada función Lambda se despliega con su propio zip. Si `getMetrics` y `createOrder` comparten un bundle, cualquier cambio en `createOrder` redespliega `getMetrics` aunque no haya cambiado nada en ella.
- Bundles más pequeños = zips más pequeños = tiempos de cold start más cortos. Lambda carga el zip completo en memoria al inicializar el contenedor.
- `splitting: false` es intencional: si dos handlers comparten código (por ejemplo, `libs/logger`), ese código se duplica en cada bundle. El trade-off es aceptable porque el código compartido suele ser pequeño y la independencia de despliegue tiene más valor.

**Por qué no `tsc` directamente:**

`tsc` transpila archivo por archivo y no resuelve imports de `node_modules` en el output. Para desplegar en Lambda sin una capa de dependencias, el bundler necesita resolver e incrustar todas las dependencias en el archivo final. `tsup` (que usa esbuild internamente) hace esto en milisegundos.

---

### 3. Capa de handlers — separación de responsabilidades

```
backend/src/
├── handlers/
│   └── getMetrics.ts          # Punto de entrada Lambda
├── services/
│   └── metrics.service.ts     # Lógica de negocio
├── models/
│   └── metrics.ts             # Schema Zod + tipo TypeScript
├── libs/
│   ├── logger.ts              # Logger JSON estructurado
│   ├── db.ts                  # Singleton pool PostgreSQL
│   └── s3.ts                  # Singleton cliente S3
└── types/
    └── api.ts                 # Helpers de respuesta APIGateway
```

**`handlers/` — un archivo = una función Lambda**

```typescript
// src/handlers/getMetrics.ts
export const handler: APIGatewayProxyHandler = async (event) => {
  logger.info('getMetrics invoked', { requestId: event.requestContext.requestId });
  try {
    const metrics = getMetrics();
    return ok(metrics);
  } catch (err) {
    logger.error('Failed to fetch metrics', { err });
    return internalError();
  }
};
```

El handler solo hace tres cosas: loguear la entrada, delegar a un servicio y mapear el resultado a una respuesta HTTP. No contiene lógica de negocio. Esto es importante porque el handler está acoplado al transporte (API Gateway); si mañana la misma lógica se invoca desde una cola SQS o un evento EventBridge, solo cambia el handler, no el servicio.

**`services/` — lógica desacoplada del transporte**

```typescript
// src/services/metrics.service.ts
export function getMetrics(): Metrics {
  return { lambdaInvocations: 120, s3StorageMB: 450, ... };
}
```

Las funciones de servicio reciben tipos primitivos o de dominio, no eventos de Lambda. Son testeables con una llamada directa sin necesidad de construir un `APIGatewayProxyEvent` falso.

**`models/` — tipo y validación en una sola declaración**

```typescript
// src/models/metrics.ts
export const MetricsSchema = z.object({
  lambdaInvocations: z.number().int().nonnegative(),
  s3StorageMB:       z.number().nonnegative(),
  apiErrors:         z.number().int().nonnegative(),
  responseTime:      z.number().nonnegative(),
  userActivity:      z.number().int().min(0).max(100),
});

export type Metrics = z.infer<typeof MetricsSchema>;
```

`z.infer` deriva el tipo TypeScript directamente del schema. Tipo y validación nunca se desincronizarán porque son la misma fuente. El schema se ejecuta en el borde del sistema (entrada del handler o salida del servicio) para que datos inválidos nunca lleguen a la lógica de negocio.

**`libs/` — singletons fuera del handler**

```typescript
// src/libs/db.ts
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ ..., max: 1 });
  }
  return pool;
}
```

Lambda reutiliza el mismo entorno de ejecución entre invocaciones calientes. Todo lo que esté en el scope del módulo (fuera del handler) se inicializa una sola vez en el cold start y persiste en invocaciones posteriores. Crear un pool TCP o un cliente de SDK dentro del handler significaría reconectarse en cada invocación.

`max: 1` en el pool de PostgreSQL es deliberado: Lambda escala creando nuevos entornos de ejecución en paralelo, no aumentando la concurrencia dentro de uno. Un pool de tamaño 1 por entorno garantiza que bajo alta carga no se agoten las conexiones de RDS.

**`types/api.ts` — respuestas consistentes**

```typescript
export function ok<T>(data: T): APIGatewayProxyResult {
  return { statusCode: 200, headers: CORS_HEADERS, body: JSON.stringify(data) };
}
```

Ningún handler construye un objeto `APIGatewayProxyResult` a mano. Los headers de CORS y el `Content-Type` se aplican en un solo lugar. Si el día de mañana se agrega un header de seguridad (`Strict-Transport-Security`, `X-Content-Type-Options`), se modifica un archivo y se propaga a todas las respuestas.

**`libs/logger.ts` — JSON estructurado para CloudWatch**

```typescript
// Ejemplo de línea de log:
// {"level":"info","msg":"getMetrics invoked","ts":"2024-01-15T10:23:01Z","requestId":"abc-123"}
```

CloudWatch Logs Insights filtra y agrega sobre campos JSON. Si el logger emite texto libre, los queries de observabilidad requieren `parse @message` con regex. Con JSON estructurado, una consulta como `filter requestId = "abc-123"` correlaciona todos los logs de una invocación específica sin parseo adicional.

---

### 4. Tests — dos capas de cobertura

```
backend/tests/
├── helpers/
│   └── index.ts                    # Fábrica de eventos mock
├── handlers/
│   └── getMetrics.test.ts          # Test del handler completo
└── services/
    └── metrics.service.test.ts     # Test unitario del servicio
```

**Configuración de Jest:**

```typescript
// jest.config.ts
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }],
  },
};
```

`ts-jest` transpila TypeScript en tiempo de ejecución durante los tests sin generar archivos intermedios. El `tsconfig.test.json` separado permite que `rootDir` abarque tanto `src/` como `tests/` sin romper el build de producción.

**Helper de eventos mock:**

```typescript
// tests/helpers/index.ts
export function mockAPIGatewayEvent(
  overrides: Partial<APIGatewayProxyEvent> = {},
): APIGatewayProxyEvent {
  return {
    httpMethod: 'GET',
    path: '/metrics',
    requestContext: { requestId: 'test-request-id', ... },
    ...overrides,
  };
}
```

Construir un `APIGatewayProxyEvent` completo a mano en cada test es ruidoso y frágil. La fábrica centraliza la estructura del evento y acepta `overrides` para los casos que necesitan variaciones (método distinto, parámetros de path, etc.).

**Test del handler:**

```typescript
// tests/handlers/getMetrics.test.ts
it('returns 200 with the fixed metrics payload', async () => {
  const result = await handler(mockAPIGatewayEvent(), {} as never, () => undefined);
  expect(result?.statusCode).toBe(200);
  expect(JSON.parse(result?.body ?? '')).toEqual({ lambdaInvocations: 120, ... });
});
```

Este test verifica que el handler compone correctamente la respuesta HTTP: código de estado, cuerpo deserializable y headers. No re-testea la lógica del servicio.

**Test del servicio:**

```typescript
// tests/services/metrics.service.test.ts
it('returns values that satisfy the Zod schema', () => {
  const result = MetricsSchema.safeParse(getMetrics());
  expect(result.success).toBe(true);
});
```

El test de servicio va un nivel más abajo: verifica que el valor devuelto satisface el schema Zod. Si alguien cambia el servicio para devolver un `userActivity` de `150` (fuera del rango `0–100` del schema), este test falla antes de que el error llegue a producción.

**Por qué separar tests de handler y de servicio:**

- El test del servicio puede fallar aunque el handler esté correcto (lógica de negocio rota).
- El test del handler puede fallar aunque el servicio esté correcto (mapeo de respuesta HTTP roto).
- La separación localiza el fallo: si solo falla el test del handler, el problema está en `types/api.ts` o en el handler mismo, no en `services/`.

---

## Comandos

```bash
# Backend
cd backend
npm install
npm run build         # compila a build/
npm test              # Jest
npm run test:coverage # Jest con cobertura

# Frontend
cd frontend
npm install
npm run dev           # Vite en http://localhost:5173
npm test              # Vitest
```

Variables de entorno del frontend: `VITE_API_URL` en `frontend/.env.development` apunta a la URL base del backend.

---

## Stack completo en local

```bash
# Terminal 1
cd backend && npm start        # puerto 4000

# Terminal 2
cd frontend && npm run dev     # puerto 5173
```

Abrir `http://localhost:5173`. El dashboard obtiene `GET /metrics` del backend y renderiza los cinco bloques de métricas.

---

## Conceptos AWS demostrados

| Bloque | Servicio AWS | Concepto |
|---|---|---|
| Lambda Invocations | AWS Lambda | Conteo de ejecuciones; simulación de invocación por click |
| S3 Storage | Amazon S3 | Almacenamiento de objetos; slider simula una subida |
| API Errors | API Gateway | Tasa de errores HTTP; log de errores desplegable |
| Response Time | API Gateway / Lambda | Latencia extremo a extremo; test asíncrono simulado |
| User Activity | CloudWatch / métrica custom | Métrica porcentual; barra de progreso animada |

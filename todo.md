# React Playground: Serverless & Cloud Concepts — Implementation Checklist

---

## Phase 1 · Backend — Express API Server

### Prompt

```text
You are building the backend for a React demo app that visualizes serverless and cloud metrics.

Tech stack: Node.js, Express, Jest, Supertest, CommonJS modules.

Task: Create a minimal Express server with one endpoint.

File structure to produce:
  backend/
  ├── src/
  │   ├── server.js
  │   └── index.js
  ├── tests/
  │   └── metrics.test.js
  └── package.json

Requirements:

package.json:
- "main": "src/index.js"
- Scripts: "start": "node src/index.js", "dev": "nodemon src/index.js", "test": "jest"
- Dependencies: express, cors
- Dev dependencies: jest, supertest, nodemon
- Jest config: "testEnvironment": "node"

src/server.js:
- Create an Express app
- Register cors() middleware (allow all origins)
- Register express.json() middleware
- Implement GET /metrics that returns status 200 and this exact JSON:
  { "lambdaInvocations": 120, "s3StorageMB": 450, "apiErrors": 3, "responseTime": 250, "userActivity": 75 }
- Export the app (do NOT call app.listen here)

src/index.js:
- Import app from ./server.js
- Call app.listen(4000, ...) and log "Backend running on port 4000"

tests/metrics.test.js — write all of the following tests using Jest + Supertest:
1. GET /metrics returns HTTP status 200
2. Response Content-Type header contains application/json
3. lambdaInvocations is 120
4. s3StorageMB is 450
5. apiErrors is 3
6. responseTime is 250
7. userActivity is 75
8. The response body has exactly 5 keys (no extra fields)

All tests must pass when running npm test.
```

### 1.1 Project Initialization
- [x] Create `backend/` directory
- [x] Run `npm init -y` inside `backend/`
- [x] Install dependencies: `express`, `cors`
- [x] Install dev dependencies: `jest`, `supertest`, `nodemon`
- [x] Add `main`, `scripts.start`, `scripts.dev`, `scripts.test` to `package.json`
- [x] Set `"type": "module"` or configure CommonJS consistently

### 1.2 Server Implementation
- [x] Create `backend/src/server.js`
- [x] Create Express app instance (exported separately from `listen` call)
- [x] Register `cors()` middleware
- [x] Register `express.json()` middleware
- [x] Implement `GET /metrics` route returning fixed JSON payload
- [x] Create `backend/src/index.js` that calls `app.listen()` (entry point)

### 1.3 Fixed Metrics Data
- [x] Define metrics object: `{ lambdaInvocations: 120, s3StorageMB: 450, apiErrors: 3, responseTime: 250, userActivity: 75 }`
- [x] Return metrics with `200` status and `Content-Type: application/json`

### 1.4 Backend Tests
- [x] Create `backend/tests/metrics.test.js`
- [x] Test: `GET /metrics` returns status `200`
- [x] Test: response `Content-Type` is `application/json`
- [x] Test: `lambdaInvocations` equals `120`
- [x] Test: `s3StorageMB` equals `450`
- [x] Test: `apiErrors` equals `3`
- [x] Test: `responseTime` equals `250`
- [x] Test: `userActivity` equals `75`
- [x] Test: response has exactly the 5 expected keys (no extra fields)
- [x] All backend tests pass (`npm test` green)

---

## Phase 2 · Frontend — Vite + React Project

### Prompt

```text
You are setting up the frontend for a React demo app that visualizes serverless and cloud metrics.

Tech stack: Vite, React 18, JavaScript (not TypeScript), Vitest, @testing-library/react,
@testing-library/jest-dom, @testing-library/user-event, jsdom.

Task: Scaffold and configure the project so tests can run immediately.

Steps:

1. The project already exists at frontend/ created by:
   npm create vite@latest frontend -- --template react
   Assume node_modules are installed.

2. frontend/vite.config.js — add a test block:
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   export default defineConfig({
     plugins: [react()],
     test: {
       globals: true,
       environment: 'jsdom',
       setupFiles: './src/setupTests.js',
     },
   })

3. frontend/src/setupTests.js — create this file:
   import '@testing-library/jest-dom'

4. frontend/package.json — add scripts:
   "test": "vitest",
   "test:ui": "vitest --ui"
   And add dev dependencies: vitest, @vitest/ui, jsdom, @testing-library/react,
   @testing-library/jest-dom, @testing-library/user-event

5. frontend/.env.development — create:
   VITE_API_URL=http://localhost:4000

6. frontend/src/App.jsx — replace boilerplate with:
   function App() {
     return <div className="app">Loading...</div>
   }
   export default App

7. frontend/src/App.test.jsx — write a smoke test:
   - Import render and screen from @testing-library/react
   - Import App from ./App
   - Test "renders without crashing": render <App /> and assert "Loading..." is in the document

8. Create empty directories (add a .gitkeep):
   - frontend/src/components/
   - frontend/src/hooks/

Run npm test — the smoke test must pass.
```

### 2.1 Project Initialization
- [ ] Scaffold with `npm create vite@latest frontend -- --template react`
- [ ] Run `npm install` inside `frontend/`
- [ ] Delete boilerplate: `src/App.css`, contents of `src/assets/`, boilerplate in `App.jsx`
- [ ] Verify `npm run dev` starts without errors

### 2.2 Testing Framework Setup
- [ ] Install dev dependencies: `vitest`, `@vitest/ui`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [ ] Add `test` config block to `vite.config.js` (environment: `jsdom`, globals: true, setupFiles)
- [ ] Create `frontend/src/setupTests.js` importing `@testing-library/jest-dom`
- [ ] Add `"test": "vitest"` and `"test:ui": "vitest --ui"` scripts to `package.json`
- [ ] Create `frontend/src/App.test.jsx` with a smoke test (renders without crash)
- [ ] Confirm `npm test` passes

### 2.3 Folder Structure
- [ ] Create `frontend/src/components/` directory
- [ ] Create `frontend/src/hooks/` directory
- [ ] Create `frontend/src/styles/` directory (or use CSS modules per component)

### 2.4 API Base URL Configuration
- [ ] Add `VITE_API_URL=http://localhost:4000` to `frontend/.env.development`
- [ ] Confirm Vite proxy or env var is usable inside components

---

## Phase 3 · Data Fetching — `useMetrics` Hook

### Prompt

```text
You are adding a data-fetching layer to a Vite React app.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react (renderHook), jsdom.
The project has VITE_API_URL set in .env.development pointing to http://localhost:4000.

Task: Implement the useMetrics hook and its tests.

frontend/src/hooks/useMetrics.js:
- Export a default function useMetrics()
- Internally use useState for { data: null, loading: true, error: null }
- On mount (useEffect with [] dependency), fetch ${import.meta.env.VITE_API_URL}/metrics
- Use an AbortController; cancel the request on cleanup to prevent state updates on
  unmounted components
- On success: set data to the parsed JSON, set loading to false
- On fetch/network error (that is not an AbortError): set error to the error message
  string, set loading to false
- Return { data, loading, error }

frontend/src/hooks/useMetrics.test.js:
- Use renderHook from @testing-library/react
- Mock global fetch using vi.stubGlobal('fetch', vi.fn())
- Restore mocks with vi.unstubAllGlobals() in afterEach

Write these tests:
1. "initial state has loading: true and data: null" — assert before the fetch resolves
2. "returns data on successful fetch" — mock fetch to resolve with the metrics JSON
   { lambdaInvocations: 120, s3StorageMB: 450, apiErrors: 3, responseTime: 250, userActivity: 75 }
   after act/waitForNextUpdate, assert data.lambdaInvocations is 120 and loading is false
3. "returns error string on fetch failure" — mock fetch to reject with new Error('Network failure')
   assert error is "Network failure" and loading is false
4. "loading is false after successful fetch" — complementary assertion to test 2

All tests must pass.
```

### 3.1 Hook Implementation
- [ ] Create `frontend/src/hooks/useMetrics.js`
- [ ] Implement `useMetrics()` returning `{ data, loading, error }`
- [ ] On mount: set `loading: true`, fetch `${VITE_API_URL}/metrics`, on success set `data` and `loading: false`
- [ ] On fetch error: set `error` message and `loading: false`
- [ ] Handle component unmount (abort controller to prevent state update on unmounted component)

### 3.2 Hook Tests
- [ ] Create `frontend/src/hooks/useMetrics.test.js`
- [ ] Mock `fetch` using `vi.stubGlobal` or `msw`
- [ ] Test: initial state is `{ data: null, loading: true, error: null }`
- [ ] Test: after successful fetch, `data` equals the metrics object
- [ ] Test: after successful fetch, `loading` is `false`
- [ ] Test: on network error, `error` is a non-null string
- [ ] Test: on network error, `loading` is `false`
- [ ] All hook tests pass

---

## Phase 4 · Base UI — `MetricBlock` Component

### Prompt

```text
You are building a reusable layout component for a React metrics dashboard.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, CSS (plain, not modules).

Task: Create MetricBlock — a full-width container that every metric block will use.

frontend/src/components/MetricBlock.jsx:

Props:
- title (string) — displayed as an <h2>
- value (number | string) — the big metric number, displayed as a <span className="metric-value">
- unit (string) — displayed inline after the value as a <span className="metric-unit">
- description (string) — supporting text, displayed as a <p>
- children — rendered inside a <div className="metric-interactive"> at the bottom

Structure:
  <section className="metric-block">
    <h2>{title}</h2>
    <div className="metric-number">
      <span className="metric-value">{value}</span>
      <span className="metric-unit">{unit}</span>
    </div>
    <p>{description}</p>
    <div className="metric-interactive">{children}</div>
  </section>

frontend/src/components/MetricBlock.css:
  .metric-block {
    width: 100%;
    box-sizing: border-box;
    padding: 2.5rem 3rem;
    border-bottom: 2px solid #e0e0e0;
    background: #fafafa;
  }
  .metric-block:nth-child(even) { background: #f0f4ff; }
  .metric-value { font-size: 3rem; font-weight: 700; color: #1a1a2e; }
  .metric-unit { font-size: 1.2rem; margin-left: 0.5rem; color: #555; }
  .metric-interactive { margin-top: 1.5rem; }

Import the CSS inside MetricBlock.jsx.

frontend/src/components/MetricBlock.test.jsx:

Write these tests:
1. Renders the title text in the document
2. Renders the value text in the document
3. Renders the unit text in the document
4. Renders the description text in the document
5. Renders children content — pass a <button>Click me</button> as child and assert it appears

All tests must pass.
```

### 4.1 Component Implementation
- [ ] Create `frontend/src/components/MetricBlock.jsx`
- [ ] Accept props: `title` (string), `value` (number/string), `unit` (string), `description` (string), `children` (React node for interactive element)
- [ ] Render full-width block (`width: 100%`) with visible border/background
- [ ] Display `title` prominently (heading level)
- [ ] Display `value` + `unit` as the main metric number
- [ ] Display `description` as supporting text
- [ ] Render `children` in a dedicated interactive zone at the bottom of the block

### 4.2 MetricBlock Tests
- [ ] Create `frontend/src/components/MetricBlock.test.jsx`
- [ ] Test: renders `title` text
- [ ] Test: renders `value` text
- [ ] Test: renders `unit` text
- [ ] Test: renders `description` text
- [ ] Test: renders `children` content inside the block
- [ ] Test: root element has full-width styling (or class)
- [ ] All MetricBlock tests pass

### 4.3 MetricBlock Styling
- [ ] Create `frontend/src/components/MetricBlock.css` (or CSS module)
- [ ] Full-width block: `width: 100%`, `box-sizing: border-box`
- [ ] Comfortable padding (`2rem` or similar)
- [ ] Alternating or consistent background color per block
- [ ] Large, readable metric value font size
- [ ] Visible separation between blocks

---

## Phase 5 · Lambda Invocations Block

### Prompt

```text
You are adding a concept block to a React metrics dashboard.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, @testing-library/user-event.

Context: A MetricBlock component already exists at frontend/src/components/MetricBlock.jsx.
It accepts title, value, unit, description, and children props and renders them in a
full-width section.

Task: Create LambdaBlock.

frontend/src/components/LambdaBlock.jsx:
- Accept prop: invocations (number)
- Render <MetricBlock title="AWS Lambda" value={invocations} unit="invocations"
  description="Total Lambda function executions">
- Internal state: simulated (number, starts at 0)
- Children to pass into MetricBlock:
  - A <button> with text "Simulate Invocation" — each click increments simulated by 1
  - A <p> showing "Simulated: {simulated}"

frontend/src/components/LambdaBlock.test.jsx:

Import render, screen from @testing-library/react and userEvent from @testing-library/user-event.

Write these tests (pass invocations={120} in all):
1. "displays invocations value" — screen.getByText('120') is in the document
2. "renders Simulate Invocation button" — button with that text is present
3. "simulated count starts at 0" — text "Simulated: 0" is in the document
4. "increments simulated count on each click" — click button 3 times; assert "Simulated: 3"
5. "simulated count is independent of invocations prop" — click once; "Simulated: 1" appears
   but "121" does not

All tests must pass.
```

### 5.1 Component Implementation
- [ ] Create `frontend/src/components/LambdaBlock.jsx`
- [ ] Accept prop: `invocations` (number)
- [ ] Render a `MetricBlock` with title `"AWS Lambda"`, value = `invocations`, unit = `"invocations"`, description = `"Total Lambda function executions"`
- [ ] Add local state: `simulated` (starts at `0`)
- [ ] Render a `"Simulate Invocation"` button
- [ ] Each click increments `simulated` by `1`
- [ ] Display `"Simulated: {simulated}"` below the button

### 5.2 LambdaBlock Tests
- [ ] Create `frontend/src/components/LambdaBlock.test.jsx`
- [ ] Test: renders `invocations` value from props
- [ ] Test: renders `"Simulate Invocation"` button
- [ ] Test: `simulated` count starts at `0`
- [ ] Test: clicking button once sets simulated count to `1`
- [ ] Test: clicking button three times sets simulated count to `3`
- [ ] All LambdaBlock tests pass

---

## Phase 6 · S3 Storage Block

### Prompt

```text
You are adding a concept block to a React metrics dashboard.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, @testing-library/user-event.

Context: A MetricBlock component already exists at frontend/src/components/MetricBlock.jsx.
It accepts title, value, unit, description, and children props.

Task: Create S3Block.

frontend/src/components/S3Block.jsx:
- Accept prop: storageMB (number)
- Render <MetricBlock title="Amazon S3" value={storageMB} unit="MB"
  description="Total data stored in S3 buckets">
- Internal state: uploadMB (number, starts at 0)
- Children to pass into MetricBlock:
  - A <label> with text "Simulate Upload (MB)"
  - An <input type="range" min={0} max={100} value={uploadMB}> that updates uploadMB on onChange
  - A <p> showing "Total with upload: {storageMB + uploadMB} MB"

frontend/src/components/S3Block.test.jsx:

Write these tests (pass storageMB={450}):
1. "displays storageMB value" — "450" is in the document
2. "renders slider input" — an element with type="range" is present
3. "initial total shows storageMB only" — text "Total with upload: 450 MB" is in the document
4. "total updates when slider changes" — fire a change event on the slider with value "50";
   assert text "Total with upload: 500 MB" is in the document

Use fireEvent.change(slider, { target: { value: '50' } }) for the slider interaction.

All tests must pass.
```

### 6.1 Component Implementation
- [ ] Create `frontend/src/components/S3Block.jsx`
- [ ] Accept prop: `storageMB` (number)
- [ ] Render a `MetricBlock` with title `"Amazon S3"`, value = `storageMB`, unit = `"MB"`, description = `"Total data stored in S3 buckets"`
- [ ] Add local state: `uploadMB` (starts at `0`)
- [ ] Render a range `<input type="range" min={0} max={100} />` labeled `"Simulate Upload (MB)"`
- [ ] Slider value updates `uploadMB`
- [ ] Display total: `"Total with upload: {storageMB + uploadMB} MB"`

### 6.2 S3Block Tests
- [ ] Create `frontend/src/components/S3Block.test.jsx`
- [ ] Test: renders `storageMB` value from props
- [ ] Test: renders the slider input
- [ ] Test: initial total displays `storageMB + 0`
- [ ] Test: changing slider to `50` displays `storageMB + 50` as total
- [ ] All S3Block tests pass

---

## Phase 7 · API Errors Block

### Prompt

```text
You are adding a concept block to a React metrics dashboard.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, @testing-library/user-event.

Context: A MetricBlock component already exists at frontend/src/components/MetricBlock.jsx.
It accepts title, value, unit, description, and children props.

Task: Create ApiErrorsBlock.

frontend/src/components/ApiErrorsBlock.jsx:
- Accept prop: errors (number)
- Render <MetricBlock title="API Gateway" value={errors} unit="errors"
  description="HTTP errors returned by the API">
- Internal state: showLog (boolean, starts false)
- Children to pass into MetricBlock:
  - A <button> that shows "Show Error Log" when showLog is false, and "Hide Error Log" when true;
    clicking toggles showLog
  - When showLog is true, render a <ul> with exactly 3 <li> items:
    "404 - Resource Not Found"
    "500 - Internal Server Error"
    "401 - Unauthorized"

frontend/src/components/ApiErrorsBlock.test.jsx:

Write these tests (pass errors={3}):
1. "displays errors value" — "3" is in the document
2. "error log is hidden initially" — "404 - Resource Not Found" is NOT in the document
3. "toggle button shows Show Error Log initially" — button text is "Show Error Log"
4. "clicking toggle reveals error list" — click button; "404 - Resource Not Found" is now visible
5. "clicking toggle changes button text to Hide Error Log" — after click, text is "Hide Error Log"
6. "clicking toggle again hides error list" — click twice; "404 - Resource Not Found" is gone again

All tests must pass.
```

### 7.1 Component Implementation
- [ ] Create `frontend/src/components/ApiErrorsBlock.jsx`
- [ ] Accept prop: `errors` (number)
- [ ] Render a `MetricBlock` with title `"API Gateway"`, value = `errors`, unit = `"errors"`, description = `"HTTP errors returned by the API"`
- [ ] Add local state: `showLog` (boolean, starts `false`)
- [ ] Render a toggle button: shows `"Show Error Log"` when `false`, `"Hide Error Log"` when `true`
- [ ] When `showLog` is `true`, render a list of 3 mock error entries (e.g., `"404 - Resource Not Found"`, `"500 - Internal Server Error"`, `"401 - Unauthorized"`)

### 7.2 ApiErrorsBlock Tests
- [ ] Create `frontend/src/components/ApiErrorsBlock.test.jsx`
- [ ] Test: renders `errors` value from props
- [ ] Test: error log is hidden on initial render
- [ ] Test: toggle button text is `"Show Error Log"` initially
- [ ] Test: clicking button reveals the error list
- [ ] Test: toggle button text changes to `"Hide Error Log"` after click
- [ ] Test: clicking button again hides the error list
- [ ] All ApiErrorsBlock tests pass

---

## Phase 8 · Response Time Block

### Prompt

```text
You are adding a concept block to a React metrics dashboard.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, @testing-library/user-event.
Use vi.useFakeTimers() for controlling setTimeout.

Context: A MetricBlock component already exists at frontend/src/components/MetricBlock.jsx.
It accepts title, value, unit, description, and children props.

Task: Create ResponseTimeBlock.

frontend/src/components/ResponseTimeBlock.jsx:
- Accept prop: responseTime (number, milliseconds)
- Render <MetricBlock title="API Response Time" value={responseTime} unit="ms"
  description="Average API response latency">
- Internal state: status — one of "idle", "testing", "done" (starts "idle")
- Children to pass into MetricBlock:
  - A <button> with text "Test Latency", disabled when status === "testing";
    on click, sets status to "testing", then after responseTime ms (via setTimeout)
    sets status to "done"
  - A <span> that shows: nothing when "idle", "Testing..." when "testing", "Done! ✓" when "done"
- Use useEffect cleanup (or store the timeout ID in a ref) to clear the timeout on unmount

frontend/src/components/ResponseTimeBlock.test.jsx:

In beforeEach: call vi.useFakeTimers()
In afterEach: call vi.useRealTimers()

Write these tests (pass responseTime={250}):
1. "displays responseTime value" — "250" is in the document
2. "button renders with Test Latency text" — button is present
3. "button is enabled initially" — button is not disabled
4. "clicking button shows Testing... and disables button" — click; assert "Testing..." is in
   the document and button is disabled
5. "after responseTime ms status changes to Done" — click; advance fake timers by 250ms with
   vi.advanceTimersByTime(250); assert "Done! ✓" is in the document and button is enabled again

All tests must pass.
```

### 8.1 Component Implementation
- [ ] Create `frontend/src/components/ResponseTimeBlock.jsx`
- [ ] Accept prop: `responseTime` (number, in ms)
- [ ] Render a `MetricBlock` with title `"API Response Time"`, value = `responseTime`, unit = `"ms"`, description = `"Average API response latency"`
- [ ] Add local state: `status` — one of `"idle"`, `"testing"`, `"done"`
- [ ] Render a `"Test Latency"` button (disabled when `status === "testing"`)
- [ ] On click: set `status` to `"testing"`, after `responseTime` milliseconds set to `"done"`
- [ ] Display status label: idle → `""`, testing → `"Testing..."`, done → `"Done! ✓"`

### 8.2 ResponseTimeBlock Tests
- [ ] Create `frontend/src/components/ResponseTimeBlock.test.jsx`
- [ ] Use `vi.useFakeTimers()` for timer control
- [ ] Test: renders `responseTime` value from props
- [ ] Test: button renders with text `"Test Latency"`
- [ ] Test: button is enabled initially
- [ ] Test: clicking button shows `"Testing..."` label and disables button
- [ ] Test: after `responseTime` ms (fake timer advance), status changes to `"Done! ✓"`
- [ ] All ResponseTimeBlock tests pass

---

## Phase 9 · User Activity Block

### Prompt

```text
You are adding the final concept block to a React metrics dashboard.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, @testing-library/user-event.

Context: A MetricBlock component already exists at frontend/src/components/MetricBlock.jsx.
It accepts title, value, unit, description, and children props.

Task: Create UserActivityBlock.

frontend/src/components/UserActivityBlock.jsx:
- Accept prop: activity (number, 0–100)
- Render <MetricBlock title="User Activity" value={activity} unit="%"
  description="Percentage of active users in the last 24 hours">
- Internal state: animated (boolean, starts false)
- Children to pass into MetricBlock:
  - A <button> with text "Load Activity", disabled when animated is true;
    on click, sets animated to true
  - A <div
      role="progressbar"
      aria-valuenow={animated ? activity : 0}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{ width: animated ? `${activity}%` : '0%', height: '1.5rem',
               background: '#4a90e2', transition: 'width 0.8s ease' }}
    />

frontend/src/components/UserActivityBlock.test.jsx:

Write these tests (pass activity={75}):
1. "displays activity value" — "75" is in the document
2. "Load Activity button is present and enabled" — button exists and is not disabled
3. "progress bar starts at 0" — getByRole('progressbar') has aria-valuenow of 0
4. "clicking Load Activity disables the button" — click button; button is disabled
5. "clicking Load Activity sets progressbar to activity value" — click; aria-valuenow equals 75

All tests must pass.
```

### 9.1 Component Implementation
- [ ] Create `frontend/src/components/UserActivityBlock.jsx`
- [ ] Accept prop: `activity` (number, 0–100 representing a percentage)
- [ ] Render a `MetricBlock` with title `"User Activity"`, value = `activity`, unit = `"%"`, description = `"Percentage of active users in the last 24 hours"`
- [ ] Add local state: `animated` (boolean, starts `false`)
- [ ] Render a `<div>` progress bar: `width: 0%` when not animated, `width: {activity}%` when animated (CSS transition)
- [ ] Render a `"Load Activity"` button
- [ ] On click: set `animated` to `true`; button becomes disabled

### 9.2 UserActivityBlock Tests
- [ ] Create `frontend/src/components/UserActivityBlock.test.jsx`
- [ ] Test: renders `activity` value from props
- [ ] Test: progress bar starts with width `"0%"` (or `aria-valuenow="0"`)
- [ ] Test: `"Load Activity"` button is enabled initially
- [ ] Test: clicking button disables the button
- [ ] Test: after click, progress bar reflects the `activity` value
- [ ] All UserActivityBlock tests pass

---

## Phase 10 · App Assembly & Integration

### Prompt

```text
You are wiring together a complete React metrics dashboard. All components and the data hook
are already implemented.

Tech stack: React 18, JavaScript, Vitest, @testing-library/react, vi.stubGlobal for fetch mocking.

Existing pieces (all in frontend/src/):
- hooks/useMetrics.js — returns { data, loading, error }; fetches ${VITE_API_URL}/metrics
- components/MetricBlock.jsx — base layout component
- components/LambdaBlock.jsx — accepts invocations prop
- components/S3Block.jsx — accepts storageMB prop
- components/ApiErrorsBlock.jsx — accepts errors prop
- components/ResponseTimeBlock.jsx — accepts responseTime prop
- components/UserActivityBlock.jsx — accepts activity prop

Task A — Update frontend/src/App.jsx:
  import useMetrics from './hooks/useMetrics'
  import LambdaBlock from './components/LambdaBlock'
  import S3Block from './components/S3Block'
  import ApiErrorsBlock from './components/ApiErrorsBlock'
  import ResponseTimeBlock from './components/ResponseTimeBlock'
  import UserActivityBlock from './components/UserActivityBlock'

  function App() {
    const { data, loading, error } = useMetrics()
    if (loading) return <p>Loading metrics...</p>
    if (error) return <p>Error: {error}</p>
    return (
      <main>
        <LambdaBlock invocations={data.lambdaInvocations} />
        <S3Block storageMB={data.s3StorageMB} />
        <ApiErrorsBlock errors={data.apiErrors} />
        <ResponseTimeBlock responseTime={data.responseTime} />
        <UserActivityBlock activity={data.userActivity} />
      </main>
    )
  }
  export default App

Task B — Update frontend/src/index.css:
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #fff; color: #333; }
  main { width: 100%; max-width: 100%; }

Task C — frontend/src/App.test.jsx (replace existing smoke test):

Mock fetch globally using vi.stubGlobal. The successful mock returns:
  { lambdaInvocations: 120, s3StorageMB: 450, apiErrors: 3, responseTime: 250, userActivity: 75 }

Restore mocks in afterEach with vi.unstubAllGlobals().

Write these tests using render, screen, waitFor from @testing-library/react:
1. "shows loading state initially" — before fetch resolves, "Loading metrics..." is in the document
2. "renders AWS Lambda block after fetch" — waitFor "AWS Lambda" text
3. "renders Amazon S3 block after fetch" — waitFor "Amazon S3" text
4. "renders API Gateway block after fetch" — waitFor "API Gateway" text
5. "renders API Response Time block after fetch" — waitFor "API Response Time" text
6. "renders User Activity block after fetch" — waitFor "User Activity" text
7. "displays lambdaInvocations value 120" — waitFor text "120"
8. "shows error message on fetch failure" — mock fetch to reject; waitFor text matching /Error:/

All tests must pass. Running npm test from frontend/ should show every test green.
```

### 10.1 App.jsx Wiring
- [ ] Update `frontend/src/App.jsx` to call `useMetrics()`
- [ ] While `loading` is `true`, render a `"Loading metrics..."` message
- [ ] If `error` is non-null, render an `"Error: {error}"` message
- [ ] When `data` is available, render all five blocks in order:
  - [ ] `<LambdaBlock invocations={data.lambdaInvocations} />`
  - [ ] `<S3Block storageMB={data.s3StorageMB} />`
  - [ ] `<ApiErrorsBlock errors={data.apiErrors} />`
  - [ ] `<ResponseTimeBlock responseTime={data.responseTime} />`
  - [ ] `<UserActivityBlock activity={data.userActivity} />`

### 10.2 Global Layout Styles
- [ ] Update `frontend/src/index.css`:
  - [ ] Reset: `margin: 0; padding: 0; box-sizing: border-box`
  - [ ] Body font, background color
  - [ ] App container: `max-width: 100%; no horizontal overflow`
- [ ] Each block stacks vertically with no gaps/overlaps between them

### 10.3 App Integration Tests
- [ ] Create/update `frontend/src/App.test.jsx`
- [ ] Mock `fetch` to return the fixed metrics JSON
- [ ] Test: shows loading state before fetch resolves
- [ ] Test: after fetch, renders `"AWS Lambda"` block title
- [ ] Test: after fetch, renders `"Amazon S3"` block title
- [ ] Test: after fetch, renders `"API Gateway"` block title
- [ ] Test: after fetch, renders `"API Response Time"` block title
- [ ] Test: after fetch, renders `"User Activity"` block title
- [ ] Test: `120` appears in the document (Lambda invocations)
- [ ] Test: on fetch failure, renders error message
- [ ] All App integration tests pass

### 10.4 End-to-End Smoke Test (Manual)
- [ ] Start backend: `cd backend && npm start` (listens on port 4000)
- [ ] Start frontend: `cd frontend && npm run dev` (listens on port 5173)
- [ ] Open browser at `http://localhost:5173`
- [ ] Confirm page loads without console errors
- [ ] Confirm all five blocks are visible on page
- [ ] Confirm metric values match the fixed JSON (`120`, `450`, `3`, `250`, `75`)
- [ ] Lambda block: click "Simulate Invocation" — counter increments
- [ ] S3 block: drag slider — total updates
- [ ] API Errors block: click "Show Error Log" — list appears; click again — list hides
- [ ] Response Time block: click "Test Latency" — shows "Testing..." then "Done! ✓"
- [ ] User Activity block: click "Load Activity" — progress bar animates to 75%

---

## Phase 11 · Final Quality Pass

### Prompt

```text
You are doing a final quality pass on a React + Node.js metrics dashboard app.

Tech stack: Node.js + Express backend, Vite + React 18 frontend.

The app has these files:
  backend/src/server.js, backend/src/index.js, backend/tests/metrics.test.js
  frontend/src/App.jsx, frontend/src/hooks/useMetrics.js
  frontend/src/components/MetricBlock.jsx, LambdaBlock.jsx, S3Block.jsx,
  ApiErrorsBlock.jsx, ResponseTimeBlock.jsx, UserActivityBlock.jsx

Tasks — go through each file and:

1. Remove any unused imports
2. Remove any console.log debug statements left from development
3. Confirm no hardcoded "http://localhost:4000" strings appear in frontend source;
   all API calls must use import.meta.env.VITE_API_URL
4. Ensure all interactive elements (<button>, <input>) are keyboard accessible
   (no tabIndex={-1} unless intentional, no onClick-only handlers on non-interactive elements)
5. Confirm the progress bar in UserActivityBlock has role="progressbar",
   aria-valuenow, aria-valuemin={0}, and aria-valuemax={100}
6. Run npm test in backend/ — confirm all tests pass with no skips
7. Run npm test in frontend/ — confirm all tests pass with no skips

Then create:
- backend/README.md with: install instructions, npm start command, npm test command,
  and a description of GET /metrics and its response shape
- frontend/README.md with: install instructions, npm run dev command, npm test command,
  and the VITE_API_URL environment variable description
```

### 11.1 All Tests Green
- [ ] `cd backend && npm test` — all tests pass
- [ ] `cd frontend && npm test` — all tests pass (no skipped)

### 11.2 Code Cleanup
- [ ] Remove any unused imports
- [ ] Remove any `console.log` debug statements
- [ ] Confirm no hardcoded localhost URLs in source (use env var)

### 11.3 Accessibility Basics
- [ ] All interactive elements are keyboard-accessible
- [ ] Buttons have visible focus rings
- [ ] Progress bar has `role="progressbar"` and `aria-valuenow`/`aria-valuemax`
- [ ] Images/icons have `alt` text (if any)

### 11.4 Documentation
- [ ] `backend/README.md`: how to install and run, test command, endpoint description
- [ ] `frontend/README.md`: how to install and run, test command, env var list

---

## Progress Summary

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Backend Express API | ✅ |
| 2 | Frontend Vite + React setup | ⬜ |
| 3 | `useMetrics` hook | ⬜ |
| 4 | `MetricBlock` base component | ⬜ |
| 5 | `LambdaBlock` | ⬜ |
| 6 | `S3Block` | ⬜ |
| 7 | `ApiErrorsBlock` | ⬜ |
| 8 | `ResponseTimeBlock` | ⬜ |
| 9 | `UserActivityBlock` | ⬜ |
| 10 | App assembly & integration | ⬜ |
| 11 | Final quality pass | ⬜ |

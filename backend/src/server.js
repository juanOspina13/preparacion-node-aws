const express = require('express');
const cors = require('cors');

const app = express();
console.log(process.env.API_KEY); // Log the API key to verify it's loaded correctly
app.use(cors());
app.use(express.json());

const metrics = {
  lambdaInvocations: 120,
  s3StorageMB: 450,
  apiErrors: 3,
  responseTime: 250,
  userActivity: 75,
};

app.get('/metrics', (req, res) => {
  res.status(200).json(metrics);
});

module.exports = app;

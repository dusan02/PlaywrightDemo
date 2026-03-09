import { options } from '../../k6.config.js';

// Smoke test configuration - quick validation
export const smokeTestOptions = {
  ...options,
  scenarios: {
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      tags: { test_type: 'smoke' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],     // Relaxed for smoke test
    http_req_failed: ['rate<0.2'],         // Allow more failures in smoke test
    http_reqs: ['rate>0.5'],               // Lower rate requirement
    iteration_duration: ['p(95)<15000'],   // Relaxed duration
  },
};

export default smokeTestOptions;

import { options } from '../../k6.config.js';

// Stress test configuration - high load testing
export const stressTestOptions = {
  ...options,
  scenarios: {
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 20 },  // Ramp up to 20 users
        { duration: '5m', target: 20 },  // Maintain 20 users
        { duration: '2m', target: 0 },   // Ramp down
      ],
      tags: { test_type: 'stress' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000'],     // Relaxed for stress test
    http_req_failed: ['rate<0.2'],         // Allow more failures under stress
    http_reqs: ['rate>2'],                 // Higher rate requirement
    iteration_duration: ['p(95)<15000'],   // Relaxed duration for stress
  },
};

export default stressTestOptions;

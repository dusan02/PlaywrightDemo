import { options } from '../../k6.config.js';

// Load test configuration - normal expected load
export const loadTestOptions = {
  ...options,
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 10 },  // Ramp up to 10 users
        { duration: '5m', target: 10 },  // Maintain 10 users
        { duration: '2m', target: 0 },   // Ramp down
      ],
      tags: { test_type: 'load' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],     // 95% requests under 2s
    http_req_failed: ['rate<0.1'],         // Less than 10% failed requests
    http_reqs: ['rate>1'],                 // More than 1 request per second
    iteration_duration: ['p(95)<10000'],   // 95% iterations under 10s
  },
};

export default loadTestOptions;

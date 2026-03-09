import { options } from '../../k6.config.js';

// Spike test configuration - sudden load increase
export const spikeTestOptions = {
  ...options,
  scenarios: {
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '1m', target: 5 },   // Normal load
        { duration: '30s', target: 50 }, // Sudden spike to 50 users
        { duration: '1m', target: 5 },   // Return to normal load
        { duration: '1m', target: 0 },   // Ramp down
      ],
      tags: { test_type: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<5000'],     // Very relaxed for spike test
    http_req_failed: ['rate<0.3'],         // Allow more failures during spike
    http_reqs: ['rate>1'],                 // Basic rate requirement
    iteration_duration: ['p(95)<20000'],   // Very relaxed duration
  },
};

export default spikeTestOptions;

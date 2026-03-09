import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
import { RCGenerator } from '../utils/k6-rcGenerator';

// Custom metrics
const errorRate = new Rate('errors');
const eoProcessDuration = new Trend('eo_process_duration');

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://vm-aisse:8081';
const EO_ENDPOINT = __ENV.EO_ENDPOINT || '/jip-kaas/login?atsId=EO';

// Test data
const testConfig = {
  birthYear: 1972,
  sex: 'M' as const,
  personalData: {
    firstName: 'Tomáš',
    lastName: 'Test',
    reason: 'duvod1'
  },
  address: {
    city: 'Benešov',
    houseNumber: '1',
    residenceFrom: '01.01.2020'
  }
};

export default function() {
  const startTime = Date.now();
  
  try {
    // 1. Generate birth certificate number
    const rc = RCGenerator.generateRC(testConfig.sex, testConfig.birthYear);
    console.log(`Generated RC: ${rc}`);
    
    // 2. Navigate to EO login page
    const loginResponse = navigateToEO();
    check(loginResponse, {
      'EO login page loaded': (r) => r.status === 200,
      'Login page contains EO button': (r) => r.body.includes('EO - Jiří Gregor'),
    });
    
    // 3. Login with generated RC
    const loginResult = performLogin(rc);
    check(loginResult, {
      'Login successful': (r) => r.status === 200,
      'Redirected to main page': (r) => r.url.includes('jip-kaas'),
    });
    
    // 4. Fill personal data
    const personalDataResult = fillPersonalData();
    check(personalDataResult, {
      'Personal data filled': (r) => r.status === 200,
    });
    
    // 5. Fill address information
    const addressResult = fillAddress();
    check(addressResult, {
      'Address filled': (r) => r.status === 200,
    });
    
    // 6. Select residence type
    const residenceResult = selectResidenceType();
    check(residenceResult, {
      'Residence type selected': (r) => r.status === 200,
    });
    
    // 7. Fill birth place
    const birthPlaceResult = fillBirthPlace();
    check(birthPlaceResult, {
      'Birth place filled': (r) => r.status === 200,
    });
    
    // 8. Select marital status
    const maritalStatusResult = selectMaritalStatus();
    check(maritalStatusResult, {
      'Marital status selected': (r) => r.status === 200,
    });
    
    // 9. Handle confirmations
    const confirmationsResult = handleConfirmations();
    check(confirmationsResult, {
      'Confirmations handled': (r) => r.status === 200,
    });
    
    // 10. Perform final revision
    const revisionResult = performFinalRevision();
    check(revisionResult, {
      'Final revision completed': (r) => r.status === 200,
    });
    
    // Record success
    errorRate.add(0);
    
  } catch (error) {
    console.error(`Test failed: ${error.message}`);
    errorRate.add(1);
  }
  
  // Record total process duration
  const totalDuration = Date.now() - startTime;
  eoProcessDuration.add(totalDuration);
  
  // Sleep between iterations
  sleep(1);
}

/**
 * Navigate to EO login page
 */
function navigateToEO() {
  const url = `${BASE_URL}${EO_ENDPOINT}`;
  return http.get(url, {
    tags: { step: 'navigate_to_eo' }
  });
}

/**
 * Perform login with birth certificate number
 */
function performLogin(rc: string) {
  const url = `${BASE_URL}/jip-kaas/login`;
  
  const payload = {
    rc: rc,
    reason: testConfig.personalData.reason
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'login' }
  });
}

/**
 * Fill personal data form
 */
function fillPersonalData() {
  const url = `${BASE_URL}/jip-kaas/personal-data`;
  
  const payload = {
    firstName: testConfig.personalData.firstName,
    lastName: testConfig.personalData.lastName
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'fill_personal_data' }
  });
}

/**
 * Fill address information
 */
function fillAddress() {
  const url = `${BASE_URL}/jip-kaas/address`;
  
  const payload = {
    city: testConfig.address.city,
    houseNumber: testConfig.address.houseNumber,
    residenceFrom: testConfig.address.residenceFrom
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'fill_address' }
  });
}

/**
 * Select residence type
 */
function selectResidenceType() {
  const url = `${BASE_URL}/jip-kaas/residence-type`;
  
  const payload = {
    residenceType: 'Platný TP'
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'select_residence_type' }
  });
}

/**
 * Fill birth place
 */
function fillBirthPlace() {
  const url = `${BASE_URL}/jip-kaas/birth-place`;
  
  const payload = {
    birthPlace: testConfig.address.city
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'fill_birth_place' }
  });
}

/**
 * Select marital status
 */
function selectMaritalStatus() {
  const url = `${BASE_URL}/jip-kaas/marital-status`;
  
  const payload = {
    maritalStatus: 'Svobodný/Svobodná'
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'select_marital_status' }
  });
}

/**
 * Handle confirmations
 */
function handleConfirmations() {
  const url = `${BASE_URL}/jip-kaas/confirmations`;
  
  const payload = {
    confirmations: ['yes', 'yes', 'mother_not_provided', 'father_not_provided']
  };
  
  return http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'handle_confirmations' }
  });
}

/**
 * Perform final revision
 */
function performFinalRevision() {
  const url = `${BASE_URL}/jip-kaas/final-revision`;
  
  return http.post(url, {}, {
    headers: { 'Content-Type': 'application/json' },
    tags: { step: 'final_revision' }
  });
}

export function handleSummary(data: any) {
  return {
    'performance-test-summary.json': JSON.stringify({
      timestamp: new Date().toISOString(),
      test_type: 'EO Performance Test',
      summary: {
        total_requests: data.metrics.http_reqs.values.count,
        failed_requests: data.metrics.http_req_failed.values.count,
        avg_response_time: data.metrics.http_req_duration.values.avg,
        p95_response_time: data.metrics.http_req_duration.values['p(95)'],
        error_rate: data.metrics.errors.values.rate,
        avg_eo_process_duration: data.metrics.eo_process_duration.values.avg,
        p95_eo_process_duration: data.metrics.eo_process_duration.values['p(95)'],
      },
      thresholds: {
        response_time_p95: data.thresholds['http_req_duration']?.ok,
        error_rate: data.thresholds['http_req_failed']?.ok,
        eo_process_duration_p95: data.thresholds['iteration_duration']?.ok,
      }
    }, null, 2),
  };
}

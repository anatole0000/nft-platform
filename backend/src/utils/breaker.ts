import CircuitBreaker from 'opossum';

export const createBreaker = <T extends (...args: any[]) => Promise<any>>(action: T, options = {}) => {
  const defaultOptions = {
    timeout: 3000,
    errorThresholdPercentage: 50,
    resetTimeout: 5000,
    ...options,
  };

  const breaker = new CircuitBreaker(action, defaultOptions);

  breaker.fallback(() => {
    console.warn('Fallback triggered - circuit open');
    throw new Error('Service temporarily unavailable');
  });

  breaker.on('open', () => console.warn('🚨 Circuit breaker opened!'));
  breaker.on('close', () => console.log('✅ Circuit breaker closed'));

  return breaker;
};

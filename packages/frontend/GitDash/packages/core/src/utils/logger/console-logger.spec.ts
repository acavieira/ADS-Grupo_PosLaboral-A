import { ConsoleLogger } from './console-logger'; // Adjust path as necessary
import type { ILoggerBase } from './types/logger-base'; // Adjust path as necessary
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';


describe('ConsoleLogger', () => {
  let logger: ILoggerBase;

  // Mock all console methods before each test
  beforeEach(() => {
    // Vitest's vi.spyOn is used to mock the console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  // Restore all console mocks after each test
  afterEach(() => {
    // vi.restoreAllMocks is the Vitest equivalent to restore mocks
    vi.restoreAllMocks();
  });

  // --- Tests without default fields ---

  describe('Without default fields', () => {
    beforeEach(() => {
      logger = new ConsoleLogger();
    });

    it('should log DEBUG level correctly without fields', () => {
      const msg = 'Debug message';
      logger.debug(msg);
      // Use toHaveBeenCalledTimes and toHaveBeenCalledWith as standard in Vitest
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Debug message');
    });

    it('should log INFO level correctly with fields', () => {
      const msg = 'Info message';
      const fields = { userId: 123, app: 'test' };
      logger.info(msg, fields);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith('[INFO] Info message', fields);
    });

    it('should log WARN level correctly without fields', () => {
      const msg = 'Warning message';
      logger.warn(msg);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith('[WARN] Warning message');
    });

    it('should log ERROR level correctly with fields', () => {
      const msg = 'Error message';
      const fields = { stack: 'trace', code: 500 };
      logger.error(msg, fields);
      expect(console.error).toHaveBeenCalledTimes(1);
      expect(console.error).toHaveBeenCalledWith('[ERROR] Error message', fields);
    });
  });

  // --- Tests with default fields ---

  describe('With default fields', () => {
    const defaultFields = { service: 'logger-service', version: '1.0.0' };

    beforeEach(() => {
      logger = new ConsoleLogger(defaultFields);
    });

    it('should include default fields when no additional fields are provided', () => {
      const msg = 'Message with defaults';
      logger.info(msg);
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith('[INFO] Message with defaults', defaultFields);
    });

    it('should merge additional fields with default fields for WARN level', () => {
      const msg = 'Message with merged fields';
      const additionalFields = { transactionId: 'abc-123', custom: true };
      const expectedFields = { ...defaultFields, ...additionalFields };

      logger.warn(msg, additionalFields);
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(console.warn).toHaveBeenCalledWith('[WARN] Message with merged fields', expectedFields);
    });

    it('should allow additional fields to override default fields', () => {
      const msg = 'Override test';
      const overrideFields = { version: '2.0.0', service: 'new-service' };
      // The implementation of mergeFields means the additional fields (overrideFields) take precedence
      const expectedFields = { ...defaultFields, ...overrideFields };

      logger.debug(msg, overrideFields);
      expect(console.log).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith('[DEBUG] Override test', expectedFields);
    });
  });

  // --- Edge Case Tests ---

  describe('Edge Cases', () => {
    it('should handle empty object in constructor gracefully', () => {
      logger = new ConsoleLogger({});
      logger.error('Empty fields test');
      expect(console.error).toHaveBeenCalledTimes(1);
      // Should only pass the formatted string, not an empty object
      expect(console.error).toHaveBeenCalledWith('[ERROR] Empty fields test');
    });

    it('should handle fields parameter being an empty object gracefully (no defaults)', () => {
      logger = new ConsoleLogger();
      logger.info('Empty fields param', {});
      expect(console.info).toHaveBeenCalledTimes(1);
      expect(console.info).toHaveBeenCalledWith('[INFO] Empty fields param');
    });
  });
});

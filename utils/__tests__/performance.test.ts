import { measurePerformance, measureAsyncPerformance } from '../performance';

describe('Performance Utils', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('measurePerformance', () => {
    it('should measure synchronous function performance', () => {
      const testFn = () => {
        for (let i = 0; i < 1000; i++) {
          Math.sqrt(i);
        }
      };

      measurePerformance('test-sync', testFn);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] test-sync:')
      );
    });
  });

  describe('measureAsyncPerformance', () => {
    it('should measure asynchronous function performance', async () => {
      const testFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      };

      await measureAsyncPerformance('test-async', testFn);

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('[Performance] test-async:')
      );
    });
  });
});

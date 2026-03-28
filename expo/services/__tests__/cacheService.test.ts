import { cacheService } from '../cacheService';

describe('CacheService', () => {
  beforeEach(async () => {
    await cacheService.clear();
  });

  it('should set and get cache values', async () => {
    await cacheService.set('test-key', { data: 'test-value' });
    const value = await cacheService.get('test-key');
    
    expect(value).toEqual({ data: 'test-value' });
  });

  it('should return null for non-existent keys', async () => {
    const value = await cacheService.get('non-existent');
    expect(value).toBeNull();
  });

  it('should respect TTL and expire cache', async () => {
    await cacheService.set('test-key', { data: 'test' }, { ttl: 100 });
    
    const immediate = await cacheService.get('test-key');
    expect(immediate).toEqual({ data: 'test' });
    
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const expired = await cacheService.get('test-key');
    expect(expired).toBeNull();
  });

  it('should delete cache entries', async () => {
    await cacheService.set('test-key', { data: 'test' });
    await cacheService.remove('test-key');
    
    const value = await cacheService.get('test-key');
    expect(value).toBeNull();
  });

  it('should clear all cache', async () => {
    await cacheService.set('key1', 'value1');
    await cacheService.set('key2', 'value2');
    
    await cacheService.clear();
    
    const value1 = await cacheService.get('key1');
    const value2 = await cacheService.get('key2');
    
    expect(value1).toBeNull();
    expect(value2).toBeNull();
  });
});

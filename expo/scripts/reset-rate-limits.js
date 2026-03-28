#!/usr/bin/env node
// Development script to reset rate limits for testing

import { rateLimiter } from '../utils/rateLimiter.js';

async function resetRateLimits() {
  const userId = 'ZbWnIlAae4X3H8RuuhyicEQTG4bY'; // Your client demo user ID
  
  console.log('Resetting rate limits for testing...');
  
  try {
    await rateLimiter.resetAllLimits(userId);
    console.log(`✅ All rate limits cleared for user: ${userId}`);
    console.log('\nYou can now test booking functionality again!');
  } catch (error) {
    console.error('❌ Error resetting rate limits:', error);
  }
  
  process.exit(0);
}

resetRateLimits().catch(console.error);
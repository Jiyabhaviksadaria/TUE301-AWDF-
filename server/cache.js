// Shared in-memory cache module (Practical 9)
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 60,      // default TTL: 60 seconds
  checkperiod: 120 // background cleanup every 120 seconds
});

// Simple cache hit/miss counters for GET /tasks and GET /tasks/:id
export const cacheCounters = {
  hits: 0,
  misses: 0,
};

export default cache;

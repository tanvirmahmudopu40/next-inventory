import LRU from 'lru-cache';

const options = {
  max: 500,
  maxAge: 1000 * 60 * 60 // 1 hour
};

const cache = new LRU(options);

export default cache;

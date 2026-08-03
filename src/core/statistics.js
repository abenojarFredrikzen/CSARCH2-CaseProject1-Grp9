export function calculateStatistics(events) {
  if (!Array.isArray(events)) {
    throw new TypeError("Events must be supplied as an array.");
  }

  const totalAccesses = events.length;
  const cacheHits = events.filter((event) => event.result === "hit").length;
  const cacheMisses = totalAccesses - cacheHits;
  const totalAccessTime = events.reduce(
    (total, event) => total + event.accessTime,
    0,
  );

  return Object.freeze({
    totalAccesses,
    cacheHits,
    cacheMisses,
    cacheHitRate: totalAccesses === 0 ? 0 : (cacheHits / totalAccesses) * 100,
    cacheMissRate:
      totalAccesses === 0 ? 0 : (cacheMisses / totalAccesses) * 100,
    averageMemoryAccessTime:
      totalAccesses === 0 ? 0 : totalAccessTime / totalAccesses,
    totalMemoryAccessTime: totalAccessTime,
  });
}


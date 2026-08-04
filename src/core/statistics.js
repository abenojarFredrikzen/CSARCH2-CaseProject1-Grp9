/**
 * Calculates the seven statistics required by the assignment.
 */

/**
 * Builds statistics from a list of completed cache events.
 *
 * @param {Object[]} events - Hit and miss events from one cache engine.
 * @returns {Object} Counts, rates, average time, and total time.
 * @throws {TypeError} When the events value is not an array.
 */
export function calculateStatistics(events) {
  if (!Array.isArray(events)) {
    throw new TypeError("Events must be supplied as an array.");
  }

  const totalAccesses = events.length;
  const cacheHits = events.filter((event) => event.result === "hit").length;

  // Every access that is not a hit is counted as a miss.
  const cacheMisses = totalAccesses - cacheHits;

  // Add the time saved in every event to get the full simulation time.
  const totalAccessTime = events.reduce(
    (total, event) => total + event.accessTime,
    0,
  );

  // Empty event lists use zero so the interface never shows a divide-by-zero result.
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
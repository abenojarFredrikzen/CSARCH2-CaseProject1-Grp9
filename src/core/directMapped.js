/**
 * Runs the Direct-Mapped side of the Machine 8 comparison.
 */

import { calculateStatistics } from "./statistics.js";
import {
  calculateAccessTime,
  normalizeTimingConfiguration,
} from "./timing.js";
import {
  validateBlockSequence,
  validateCacheBlocks,
} from "./validation.js";

/**
 * Makes a cache where every line starts empty.
 *
 * @param {number} cacheBlocks - Number of lines in the cache.
 * @returns {Object[]} Empty Direct-Mapped cache lines.
 */
function createEmptyCache(cacheBlocks) {
  return Array.from({ length: cacheBlocks }, (_, lineIndex) => ({
    lineIndex,
    valid: false,
    block: null,
    tag: null,
  }));
}

/**
 * Copies the current cache state for one event.
 *
 * @param {Object[]} cache - Current cache lines.
 * @returns {Object[]} A copy that cannot be changed later.
 */
function snapshotCache(cache) {
  // Frozen copies keep older steps safe when the live cache changes.
  return Object.freeze(
    cache.map((line) => Object.freeze({ ...line })),
  );
}

/**
 * Runs a full Direct-Mapped cache simulation.
 *
 * @param {Object} configuration - Settings used by the simulation.
 * @param {number[]} configuration.sequence - Shared block-access sequence.
 * @param {number} configuration.cacheBlocks - Number of cache lines.
 * @param {number} configuration.blockSize - Number of words in one block.
 * @param {string} configuration.readPolicy - Selected read policy.
 * @param {Object} configuration.timing - Timing values used by the simulator.
 * @returns {Object} Events, final cache state, statistics, and timing unit.
 */
export function simulateDirectMapped({
  sequence,
  cacheBlocks,
  blockSize,
  readPolicy,
  timing,
}) {
  validateCacheBlocks(cacheBlocks);
  const safeSequence = validateBlockSequence(sequence);
  const timingConfiguration = normalizeTimingConfiguration({
    blockSize,
    readPolicy,
    timing,
  });
  const cache = createEmptyCache(cacheBlocks);
  const events = [];

  safeSequence.forEach((requestedBlock, sequenceIndex) => {
    const step = sequenceIndex + 1;

    // Each memory block has only one cache line where it can be stored.
    const lineIndex = requestedBlock % cacheBlocks;

    // The tag tells apart blocks that map to the same line.
    const tag = Math.floor(requestedBlock / cacheBlocks);
    const line = cache[lineIndex];

    // A hit needs a valid line that already holds the requested block.
    const hit = line.valid && line.block === requestedBlock;
    const evictedBlock = !hit && line.valid ? line.block : null;

    // A miss fills the mapped line or replaces the block already inside it.
    if (!hit) {
      line.valid = true;
      line.block = requestedBlock;
      line.tag = tag;
    }

    const result = hit ? "hit" : "miss";
    let message;

    if (hit) {
      message = `Hit: block ${requestedBlock} is already in line ${lineIndex}.`;
    } else if (evictedBlock === null) {
      message = `Miss: block ${requestedBlock} loaded into empty line ${lineIndex}.`;
    } else {
      message = `Miss: block ${requestedBlock} replaced block ${evictedBlock} in line ${lineIndex}.`;
    }

    // Save everything the interface needs to show this step later!!
    events.push(
      Object.freeze({
        organization: "direct-mapped",
        step,
        requestedBlock,
        result,
        lineIndex,
        tag,
        evictedBlock,
        accessTime: calculateAccessTime(result, timingConfiguration),
        cacheSnapshot: snapshotCache(cache),
        message,
        mruInformation: null,
      }),
    );
  });

  return Object.freeze({
    organization: "direct-mapped",
    events: Object.freeze(events),
    finalCache: snapshotCache(cache),
    statistics: calculateStatistics(events),
    timingUnit: timingConfiguration.unit,
  });
}
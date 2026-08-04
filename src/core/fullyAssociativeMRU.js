/**
 * Runs the Fully Associative + MRU side of the Machine 8 comparison.
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
 * @returns {Object[]} Empty Fully Associative cache lines.
 */
function createEmptyCache(cacheBlocks) {
  return Array.from({ length: cacheBlocks }, (_, lineIndex) => ({
    lineIndex,
    valid: false,
    block: null,
    tag: null,
    lastUsedAt: null,
  }));
}

/**
 * Finds the line that was used most recently.
 *
 * @param {Object[]} cache - Current cache lines.
 * @returns {Object|null} The MRU line, or null when the cache is empty.
 */
function findMostRecentlyUsedLine(cache) {
  return cache.reduce((mostRecent, line) => {
    if (!line.valid) {
      return mostRecent;
    }

    if (mostRecent === null || line.lastUsedAt > mostRecent.lastUsedAt) {
      return line;
    }

    return mostRecent;
  }, null);
}

/**
 * Copies the cache and marks its current MRU line.
 *
 * @param {Object[]} cache - Current cache lines.
 * @param {number|null} mostRecentLineIndex - Index of the MRU line.
 * @returns {Object[]} A copy that cannot be changed later.
 */
function snapshotCache(cache, mostRecentLineIndex) {
  // Frozen copies keep older steps safe when the live cache changes.
  return Object.freeze(
    cache.map((line) =>
      Object.freeze({
        ...line,
        isMostRecentlyUsed:
          line.valid && line.lineIndex === mostRecentLineIndex,
      }),
    ),
  );
}

/**
 * Runs a full Fully Associative cache simulation using MRU replacement.
 *
 * @param {Object} configuration - Settings used by the simulation.
 * @param {number[]} configuration.sequence - Shared block-access sequence.
 * @param {number} configuration.cacheBlocks - Number of cache lines.
 * @param {number} configuration.blockSize - Number of words in one block.
 * @param {string} configuration.readPolicy - Selected read policy.
 * @param {Object} configuration.timing - Timing values used by the simulator.
 * @returns {Object} Events, final cache state, statistics, and timing unit.
 */
export function simulateFullyAssociativeMRU({
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

    // A block may be stored in any line, so every valid line is checked.
    let line = cache.find(
      (candidate) => candidate.valid && candidate.block === requestedBlock,
    );
    const hit = line !== undefined;
    let evictedBlock = null;

    if (!hit) {
      // Use the first empty line before removing any block.
      line = cache.find((candidate) => !candidate.valid);

      if (line === undefined) {
        // A full cache removes the line that was used most recently.
        line = findMostRecentlyUsedLine(cache);
        evictedBlock = line.block;
      }

      line.valid = true;
      line.block = requestedBlock;

      // There is no fixed line, so the block number can be used as the tag.
      line.tag = requestedBlock;
    }

    // A hit or a new block becomes the most recently used line.
    line.lastUsedAt = step;
    const lineIndex = line.lineIndex;
    const result = hit ? "hit" : "miss";
    let message;

    if (hit) {
      message = `Hit: block ${requestedBlock} in line ${lineIndex} is now most recently used.`;
    } else if (evictedBlock === null) {
      message = `Miss: block ${requestedBlock} loaded into empty line ${lineIndex} and marked most recently used.`;
    } else {
      message = `Miss: block ${requestedBlock} replaced the most recently used block ${evictedBlock} in line ${lineIndex}.`;
    }

    // Save everything the interface needs to show this step later.
    events.push(
      Object.freeze({
        organization: "fully-associative-mru",
        step,
        requestedBlock,
        result,
        lineIndex,
        tag: requestedBlock,
        evictedBlock,
        accessTime: calculateAccessTime(result, timingConfiguration),
        cacheSnapshot: snapshotCache(cache, lineIndex),
        message,
        mruInformation: Object.freeze({
          mostRecentLineIndex: lineIndex,
          mostRecentBlock: requestedBlock,
        }),
      }),
    );
  });

  // Mark the final MRU line in the last cache snapshot.
  const mostRecentLine = findMostRecentlyUsedLine(cache);

  return Object.freeze({
    organization: "fully-associative-mru",
    events: Object.freeze(events),
    finalCache: snapshotCache(cache, mostRecentLine?.lineIndex ?? null),
    statistics: calculateStatistics(events),
    timingUnit: timingConfiguration.unit,
  });
}
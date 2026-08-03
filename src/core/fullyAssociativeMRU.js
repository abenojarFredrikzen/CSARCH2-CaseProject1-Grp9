import { calculateStatistics } from "./statistics.js";
import {
  calculateAccessTime,
  normalizeTimingConfiguration,
} from "./timing.js";
import {
  validateBlockSequence,
  validateCacheBlocks,
} from "./validation.js";

function createEmptyCache(cacheBlocks) {
  return Array.from({ length: cacheBlocks }, (_, lineIndex) => ({
    lineIndex,
    valid: false,
    block: null,
    tag: null,
    lastUsedAt: null,
  }));
}

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

function snapshotCache(cache, mostRecentLineIndex) {
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
    let line = cache.find(
      (candidate) => candidate.valid && candidate.block === requestedBlock,
    );
    const hit = line !== undefined;
    let evictedBlock = null;

    if (!hit) {
      line = cache.find((candidate) => !candidate.valid);

      if (line === undefined) {
        line = findMostRecentlyUsedLine(cache);
        evictedBlock = line.block;
      }

      line.valid = true;
      line.block = requestedBlock;
      // A fully associative cache has no index bits, so its tag identifies the
      // complete main-memory block.
      line.tag = requestedBlock;
    }

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

  const mostRecentLine = findMostRecentlyUsedLine(cache);

  return Object.freeze({
    organization: "fully-associative-mru",
    events: Object.freeze(events),
    finalCache: snapshotCache(cache, mostRecentLine?.lineIndex ?? null),
    statistics: calculateStatistics(events),
    timingUnit: timingConfiguration.unit,
  });
}

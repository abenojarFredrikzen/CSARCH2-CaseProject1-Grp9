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
  }));
}

function snapshotCache(cache) {
  return Object.freeze(
    cache.map((line) => Object.freeze({ ...line })),
  );
}

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
    const lineIndex = requestedBlock % cacheBlocks;
    const tag = Math.floor(requestedBlock / cacheBlocks);
    const line = cache[lineIndex];
    const hit = line.valid && line.block === requestedBlock;
    const evictedBlock = !hit && line.valid ? line.block : null;

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

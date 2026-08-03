import {
  MAIN_MEMORY_BLOCKS,
  validateRequiredTraceSize,
} from "./validation.js";

export const TRACE_TYPES = Object.freeze({
  SEQUENTIAL: "sequential",
  MID_REPEAT: "mid-repeat",
  RANDOM: "random",
});

export const RANDOM_ACCESS_COUNT = 64;
export const MAX_RANDOM_SEED = 0xffffffff;

function range(start, endInclusive, step = 1) {
  const values = [];

  if (step > 0) {
    for (let value = start; value <= endInclusive; value += step) {
      values.push(value);
    }
  } else {
    for (let value = start; value >= endInclusive; value += step) {
      values.push(value);
    }
  }

  return values;
}

export function generateSequentialSequence(cacheBlocks) {
  validateRequiredTraceSize(cacheBlocks);
  const pass = range(0, 2 * cacheBlocks - 1);

  // The assignment example shows two total passes, not an initial pass plus
  // two additional repetitions.
  return [...pass, ...pass];
}

export function generateMidRepeatSequence(cacheBlocks) {
  validateRequiredTraceSize(cacheBlocks);

  const shortForward = range(0, cacheBlocks - 1);
  const longForward = range(0, 2 * cacheBlocks - 1);
  const shortReverse = range(cacheBlocks - 1, 0, -1);
  const longReverse = range(2 * cacheBlocks - 1, 0, -1);

  return [
    ...shortForward,
    ...longForward,
    ...longForward,
    ...shortReverse,
    ...longReverse,
    ...longReverse,
  ];
}

function validateSeed(seed) {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > MAX_RANDOM_SEED) {
    throw new RangeError(
      `Random seed must be an integer from 0 to ${MAX_RANDOM_SEED}.`,
    );
  }
}

function createSeededRandom(seed) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateRandomSequence(seed) {
  validateSeed(seed);
  const random = createSeededRandom(seed);

  return Array.from({ length: RANDOM_ACCESS_COUNT }, () =>
    Math.floor(random() * MAIN_MEMORY_BLOCKS),
  );
}

export function generateTrace({ type, cacheBlocks, seed = 9 }) {
  switch (type) {
    case TRACE_TYPES.SEQUENTIAL:
      return generateSequentialSequence(cacheBlocks);
    case TRACE_TYPES.MID_REPEAT:
      return generateMidRepeatSequence(cacheBlocks);
    case TRACE_TYPES.RANDOM:
      return generateRandomSequence(seed);
    default:
      throw new RangeError(`Unknown trace type: ${type}`);
  }
}


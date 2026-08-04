/**
 * Builds the three access sequences required by the assignment.
 */

import {
  MAIN_MEMORY_BLOCKS,
  validateRequiredTraceSize,
} from "./validation.js";

// These values are used by the test-case selector in the interface.
export const TRACE_TYPES = Object.freeze({
  SEQUENTIAL: "sequential",
  MID_REPEAT: "mid-repeat",
  RANDOM: "random",
});

export const RANDOM_ACCESS_COUNT = 64;
export const MAX_RANDOM_SEED = 0xffffffff;

/**
 * Makes a list of numbers from the starting value to the ending value.
 *
 * @param {number} start - First number in the list.
 * @param {number} endInclusive - Last number in the list.
 * @param {number} [step=1] - Amount added after each number.
 * @returns {number[]} The completed list of numbers.
 */
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

/**
 * Builds the required two-pass Sequential sequence.
 *
 * @param {number} cacheBlocks - Total number of cache blocks, also called `n`.
 * @returns {number[]} A sequence with `4n` total accesses.
 */
export function generateSequentialSequence(cacheBlocks) {
  validateRequiredTraceSize(cacheBlocks);
  const pass = range(0, 2 * cacheBlocks - 1);

  // The assignment example repeats the full list two times in total.
  return [...pass, ...pass];
}

/**
 * Builds the required forward and reverse Mid-repeat sequence.
 *
 * @param {number} cacheBlocks - Total number of cache blocks, also called `n`.
 * @returns {number[]} A sequence with `10n` total accesses.
 */
export function generateMidRepeatSequence(cacheBlocks) {
  validateRequiredTraceSize(cacheBlocks);

  // The short parts use `n` blocks. The long parts use `2n` blocks.
  const shortForward = range(0, cacheBlocks - 1);
  const longForward = range(0, 2 * cacheBlocks - 1);
  const shortReverse = range(cacheBlocks - 1, 0, -1);
  const longReverse = range(2 * cacheBlocks - 1, 0, -1);

  // Follow the exact order shown in the assignment example.
  return [
    ...shortForward,
    ...longForward,
    ...longForward,
    ...shortReverse,
    ...longReverse,
    ...longReverse,
  ];
}

/**
 * Checks if a seed can be used by the random number generator.
 *
 * @param {number} seed - Number used to repeat a Random sequence.
 * @throws {RangeError} When the seed is outside the allowed range.
 */
function validateSeed(seed) {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > MAX_RANDOM_SEED) {
    throw new RangeError(
      `Random seed must be an integer from 0 to ${MAX_RANDOM_SEED}.`,
    );
  }
}

/**
 * Makes a random number function that gives the same results for the same seed.
 *
 * @param {number} seed - Starting value for the random number function.
 * @returns {Function} A function that returns a number from 0 up to, but not including, 1.
 */
function createSeededRandom(seed) {
  // Keep the starting value as a 32-bit number.
  let state = seed >>> 0;

  return () => {
    // Mix the bits so each call gives a new value.
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Builds the required 64-access Random sequence.
 *
 * @param {number} seed - Number used to repeat the same sequence later.
 * @returns {number[]} Sixty-four block numbers from 0 to 1,023.
 */
export function generateRandomSequence(seed) {
  validateSeed(seed);
  const random = createSeededRandom(seed);

  return Array.from({ length: RANDOM_ACCESS_COUNT }, () =>
    Math.floor(random() * MAIN_MEMORY_BLOCKS),
  );
}

/**
 * Builds the sequence selected in the interface.
 *
 * @param {Object} options - Settings used to build the sequence.
 * @param {string} options.type - Sequential, Mid-repeat, or Random.
 * @param {number} options.cacheBlocks - Total number of cache blocks.
 * @param {number} [options.seed=9] - Seed used by the Random sequence.
 * @returns {number[]} The completed access sequence.
 * @throws {RangeError} When the test-case type is unknown.
 */
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
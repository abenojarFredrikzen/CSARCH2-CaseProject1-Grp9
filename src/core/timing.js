/**
 * Checks timing values and calculates the time for each cache access.
 */

import {
  READ_POLICIES,
  validateBlockSize,
  validateReadPolicy,
} from "./validation.js";

// These are starting values because the assignment does not give fixed times.
export const DEFAULT_TIMING = Object.freeze({
  cacheAccessTime: 1,
  firstMemoryWordTime: 100,
  additionalWordTime: 10,
  unit: "ns",
});

/**
 * Checks if a timing value is a valid number.
 *
 * @param {number} value - Timing value to check.
 * @param {string} name - Name used in the error message.
 * @param {boolean} [allowZero=false] - Allows zero when set to true.
 * @returns {number} The same value when it is valid.
 * @throws {RangeError} When the value is not allowed.
 */
function validatePositiveTime(value, name, allowZero = false) {
  const minimumIsValid = allowZero ? value >= 0 : value > 0;

  if (!Number.isFinite(value) || !minimumIsValid) {
    throw new RangeError(`${name} must be a finite ${allowZero ? "non-negative" : "positive"} number.`);
  }

  return value;
}

/**
 * Checks all timing settings and puts them in one clear object.
 *
 * @param {Object} configuration - Block, policy, and timing settings.
 * @returns {Object} A checked timing object that cannot be changed.
 */
export function normalizeTimingConfiguration(configuration) {
  const { blockSize, readPolicy } = configuration;

  // Timing values may be inside `timing` or passed in directly by an engine.
  const timing = configuration.timing ?? configuration;
  validateBlockSize(blockSize);
  validateReadPolicy(readPolicy);

  const normalized = {
    cacheAccessTime: timing.cacheAccessTime,
    firstMemoryWordTime: timing.firstMemoryWordTime,
    additionalWordTime: timing.additionalWordTime,
    unit: timing.unit ?? DEFAULT_TIMING.unit,
  };

  validatePositiveTime(normalized.cacheAccessTime, "Cache access time");
  validatePositiveTime(normalized.firstMemoryWordTime, "First memory word time");
  validatePositiveTime(
    normalized.additionalWordTime,
    "Additional word time",
    true,
  );

  if (typeof normalized.unit !== "string" || normalized.unit.trim() === "") {
    throw new TypeError("Timing unit must be a non-empty string.");
  }

  return Object.freeze({
    ...normalized,
    blockSize,
    readPolicy,
  });
}

/**
 * Calculates the time used by one cache hit or miss.
 *
 * @param {string} result - Either `hit` or `miss`.
 * @param {Object} configuration - Block, policy, and timing settings.
 * @returns {number} Time used by the access.
 */
export function calculateAccessTime(result, configuration) {
  const timing = normalizeTimingConfiguration(configuration);

  // A hit only needs one cache access.
  if (result === "hit") {
    return timing.cacheAccessTime;
  }

  if (result !== "miss") {
    throw new RangeError('Access result must be either "hit" or "miss".');
  }

  // Load-through sends the requested word as soon as it arrives.
  if (timing.readPolicy === READ_POLICIES.LOAD_THROUGH) {
    return timing.cacheAccessTime + timing.firstMemoryWordTime;
  }

  /*
   * Non-load-through waits for the full block, then reads the cache again:
   * C + M + (B - 1)R + C
   */
  return (
    timing.cacheAccessTime +
    timing.firstMemoryWordTime +
    (timing.blockSize - 1) * timing.additionalWordTime +
    timing.cacheAccessTime
  );
}
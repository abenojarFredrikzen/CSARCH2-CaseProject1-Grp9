import {
  READ_POLICIES,
  validateBlockSize,
  validateReadPolicy,
} from "./validation.js";

export const DEFAULT_TIMING = Object.freeze({
  cacheAccessTime: 1,
  firstMemoryWordTime: 100,
  additionalWordTime: 10,
  unit: "ns",
});

function validatePositiveTime(value, name, allowZero = false) {
  const minimumIsValid = allowZero ? value >= 0 : value > 0;

  if (!Number.isFinite(value) || !minimumIsValid) {
    throw new RangeError(`${name} must be a finite ${allowZero ? "non-negative" : "positive"} number.`);
  }

  return value;
}

export function normalizeTimingConfiguration(configuration) {
  const { blockSize, readPolicy } = configuration;
  // Accept either a public { timing: ... } configuration or an already
  // normalized timing object used internally by the engines.
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

export function calculateAccessTime(result, configuration) {
  const timing = normalizeTimingConfiguration(configuration);

  if (result === "hit") {
    return timing.cacheAccessTime;
  }

  if (result !== "miss") {
    throw new RangeError('Access result must be either "hit" or "miss".');
  }

  if (timing.readPolicy === READ_POLICIES.LOAD_THROUGH) {
    return timing.cacheAccessTime + timing.firstMemoryWordTime;
  }

  return (
    timing.cacheAccessTime +
    timing.firstMemoryWordTime +
    (timing.blockSize - 1) * timing.additionalWordTime +
    timing.cacheAccessTime
  );
}

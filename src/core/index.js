/**
 * Gives the interface one place to import all public simulator tools.
 */

export { simulateDirectMapped } from "./directMapped.js";
export { simulateFullyAssociativeMRU } from "./fullyAssociativeMRU.js";
export { simulateComparison } from "./simulate.js";
export { calculateStatistics } from "./statistics.js";
export {
  DEFAULT_TIMING,
  calculateAccessTime,
  normalizeTimingConfiguration,
} from "./timing.js";
export {
  MAX_RANDOM_SEED,
  RANDOM_ACCESS_COUNT,
  TRACE_TYPES,
  generateMidRepeatSequence,
  generateRandomSequence,
  generateSequentialSequence,
  generateTrace,
} from "./traceGenerators.js";
export {
  MAIN_MEMORY_BLOCKS,
  READ_POLICIES,
  isPowerOfTwo,
  validateBlockSequence,
  validateBlockSize,
  validateCacheBlocks,
  validateReadPolicy,
  validateRequiredTraceSize,
} from "./validation.js";
import { simulateDirectMapped } from "./directMapped.js";
import { simulateFullyAssociativeMRU } from "./fullyAssociativeMRU.js";
import {
  validateBlockSequence,
  validateCacheBlocks,
} from "./validation.js";

export function simulateComparison(configuration) {
  validateCacheBlocks(configuration.cacheBlocks);
  const sequence = Object.freeze(
    validateBlockSequence(configuration.sequence),
  );
  const sharedConfiguration = {
    ...configuration,
    sequence,
  };

  const directMapped = simulateDirectMapped(sharedConfiguration);
  const fullyAssociativeMRU =
    simulateFullyAssociativeMRU(sharedConfiguration);

  if (directMapped.events.length !== fullyAssociativeMRU.events.length) {
    throw new Error("Both cache engines must process the same number of accesses.");
  }

  return Object.freeze({
    sequence,
    directMapped,
    fullyAssociativeMRU,
  });
}


/**
 * Runs both cache engines with the same settings and access sequence.
 */

import { simulateDirectMapped } from "./directMapped.js";
import { simulateFullyAssociativeMRU } from "./fullyAssociativeMRU.js";
import {
  validateBlockSequence,
  validateCacheBlocks,
} from "./validation.js";

/**
 * Creates the full Machine 8 comparison.
 *
 * @param {Object} configuration - Shared settings for both cache engines.
 * @returns {Object} The shared sequence and both simulation results.
 */
export function simulateComparison(configuration) {
  validateCacheBlocks(configuration.cacheBlocks);

  // Copy and freeze the sequence so neither engine can change it.
  const sequence = Object.freeze(
    validateBlockSequence(configuration.sequence),
  );
  const sharedConfiguration = {
    ...configuration,
    sequence,
  };

  // Both engines receive this exact same configuration.
  const directMapped = simulateDirectMapped(sharedConfiguration);
  const fullyAssociativeMRU =
    simulateFullyAssociativeMRU(sharedConfiguration);

  // This check catches a problem if one engine skips or adds an access.
  if (directMapped.events.length !== fullyAssociativeMRU.events.length) {
    throw new Error("Both cache engines must process the same number of accesses.");
  }

  // Freeze the result so the interface can read it without changing it.
  return Object.freeze({
    sequence,
    directMapped,
    fullyAssociativeMRU,
  });
}
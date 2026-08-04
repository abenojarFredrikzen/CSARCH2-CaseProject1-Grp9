/**
 * Checks values before they are used by the cache simulator.
 */

// The assignment fixes main memory at 1,024 blocks.
export const MAIN_MEMORY_BLOCKS = 1024;

// These are the two read policies shown in the assignment.
export const READ_POLICIES = Object.freeze({
  LOAD_THROUGH: "load-through",
  NON_LOAD_THROUGH: "non-load-through",
});

/**
 * Checks if a value is a positive power of two.
 *
 * @param {number} value - The number to check.
 * @returns {boolean} True when the value is a power of two.
 */
export function isPowerOfTwo(value) {
  return (
    Number.isSafeInteger(value) &&
    value > 0 &&
    Number.isInteger(Math.log2(value))
  );
}

/**
 * Checks if the block size follows the assignment rules.
 *
 * @param {number} blockSize - Number of words in one block.
 * @returns {number} The same block size when it is valid.
 * @throws {RangeError} When the block size is too small or not a power of two.
 */
export function validateBlockSize(blockSize) {
  if (!isPowerOfTwo(blockSize) || blockSize < 2) {
    throw new RangeError("Block size must be a power of two and at least 2 words.");
  }

  return blockSize;
}

/**
 * Checks if the number of cache blocks follows the assignment rules.
 *
 * @param {number} cacheBlocks - Number of blocks in the cache.
 * @returns {number} The same number when it is valid.
 * @throws {RangeError} When the value is too small or not a power of two.
 */
export function validateCacheBlocks(cacheBlocks) {
  if (!isPowerOfTwo(cacheBlocks) || cacheBlocks < 4) {
    throw new RangeError(
      "Number of cache blocks must be a power of two and at least 4.",
    );
  }

  return cacheBlocks;
}

/**
 * Makes sure a required trace can fit inside main memory.
 *
 * @param {number} cacheBlocks - Number of blocks in the cache.
 * @returns {number} The same number when the trace can fit.
 * @throws {RangeError} When block `2n - 1` would be outside main memory.
 */
export function validateRequiredTraceSize(cacheBlocks) {
  validateCacheBlocks(cacheBlocks);

  // Sequential and Mid-repeat can reach block `2n - 1`.
  if (2 * cacheBlocks > MAIN_MEMORY_BLOCKS) {
    throw new RangeError(
      "The required 0 to 2n-1 trace must fit within the 1024-block main memory.",
    );
  }

  return cacheBlocks;
}

/**
 * Checks if the selected read policy is supported.
 *
 * @param {string} readPolicy - Read policy selected by the user.
 * @returns {string} The same policy when it is valid.
 * @throws {RangeError} When the policy is not one of the two choices.
 */
export function validateReadPolicy(readPolicy) {
  if (!Object.values(READ_POLICIES).includes(readPolicy)) {
    throw new RangeError(
      `Read policy must be "${READ_POLICIES.LOAD_THROUGH}" or "${READ_POLICIES.NON_LOAD_THROUGH}".`,
    );
  }

  return readPolicy;
}

/**
 * Checks every block number in an access sequence.
 *
 * @param {number[]} sequence - Block numbers that will be accessed.
 * @returns {number[]} A copy of the checked sequence.
 * @throws {TypeError} When the sequence is not an array.
 * @throws {RangeError} When a block number is outside main memory.
 */
export function validateBlockSequence(sequence) {
  if (!Array.isArray(sequence)) {
    throw new TypeError("The access sequence must be an array of block indices.");
  }

  sequence.forEach((block, index) => {
    if (
      !Number.isSafeInteger(block) ||
      block < 0 ||
      block >= MAIN_MEMORY_BLOCKS
    ) {
      throw new RangeError(
        `Access ${index + 1} must be an integer block index from 0 to ${MAIN_MEMORY_BLOCKS - 1}.`,
      );
    }
  });

  // Return a copy so outside code cannot change the original array by accident.
  return [...sequence];
}
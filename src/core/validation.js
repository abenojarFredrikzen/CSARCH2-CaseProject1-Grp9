export const MAIN_MEMORY_BLOCKS = 1024;

export const READ_POLICIES = Object.freeze({
  LOAD_THROUGH: "load-through",
  NON_LOAD_THROUGH: "non-load-through",
});

export function isPowerOfTwo(value) {
  return (
    Number.isSafeInteger(value) &&
    value > 0 &&
    Number.isInteger(Math.log2(value))
  );
}

export function validateBlockSize(blockSize) {
  if (!isPowerOfTwo(blockSize) || blockSize < 2) {
    throw new RangeError("Block size must be a power of two and at least 2 words.");
  }

  return blockSize;
}

export function validateCacheBlocks(cacheBlocks) {
  if (!isPowerOfTwo(cacheBlocks) || cacheBlocks < 4) {
    throw new RangeError(
      "Number of cache blocks must be a power of two and at least 4.",
    );
  }

  return cacheBlocks;
}

export function validateRequiredTraceSize(cacheBlocks) {
  validateCacheBlocks(cacheBlocks);

  if (2 * cacheBlocks > MAIN_MEMORY_BLOCKS) {
    throw new RangeError(
      "The required 0 to 2n-1 trace must fit within the 1024-block main memory.",
    );
  }

  return cacheBlocks;
}

export function validateReadPolicy(readPolicy) {
  if (!Object.values(READ_POLICIES).includes(readPolicy)) {
    throw new RangeError(
      `Read policy must be "${READ_POLICIES.LOAD_THROUGH}" or "${READ_POLICIES.NON_LOAD_THROUGH}".`,
    );
  }

  return readPolicy;
}

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

  return [...sequence];
}


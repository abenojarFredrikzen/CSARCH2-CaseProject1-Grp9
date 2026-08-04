/**
 * Checks all timing formulas, required statistics, and invalid input handling.
 */

import { describe, expect, it } from "vitest";
import { calculateStatistics } from "../statistics.js";
import { calculateAccessTime } from "../timing.js";
import {
  READ_POLICIES,
  validateBlockSequence,
  validateBlockSize,
  validateCacheBlocks,
} from "../validation.js";

// Simple timing values make each expected answer easy to calculate by hand.
const timing = {
  cacheAccessTime: 2,
  firstMemoryWordTime: 50,
  additionalWordTime: 5,
  unit: "ns",
};

describe("timing model", () => {
  it("uses cache time for a hit", () => {
    expect(
      calculateAccessTime("hit", {
        blockSize: 4,
        readPolicy: READ_POLICIES.LOAD_THROUGH,
        timing,
      }),
    ).toBe(2);
  });

  it("returns the requested word early for load-through misses", () => {
    expect(
      calculateAccessTime("miss", {
        blockSize: 4,
        readPolicy: READ_POLICIES.LOAD_THROUGH,
        timing,
      }),
    ).toBe(52);
  });

  it("waits for the block and a final cache access for non-load-through", () => {
    expect(
      calculateAccessTime("miss", {
        blockSize: 4,
        readPolicy: READ_POLICIES.NON_LOAD_THROUGH,
        timing,
      }),
    ).toBe(69);
  });
});

describe("statistics", () => {
  it("derives all required values from the event history", () => {
    expect(
      calculateStatistics([
        { result: "miss", accessTime: 52 },
        { result: "hit", accessTime: 2 },
        { result: "hit", accessTime: 2 },
        { result: "miss", accessTime: 52 },
      ]),
    ).toEqual({
      totalAccesses: 4,
      cacheHits: 2,
      cacheMisses: 2,
      cacheHitRate: 50,
      cacheMissRate: 50,
      averageMemoryAccessTime: 27,
      totalMemoryAccessTime: 108,
    });
  });
});

describe("input validation", () => {
  it("accepts required minimum powers of two", () => {
    expect(validateBlockSize(2)).toBe(2);
    expect(validateCacheBlocks(4)).toBe(4);
  });

  it("rejects invalid powers of two", () => {
    expect(() => validateBlockSize(1)).toThrow(/power of two/);
    expect(() => validateBlockSize(2.5)).toThrow(/power of two/);
    expect(() => validateBlockSize(3)).toThrow(/power of two/);
    expect(() => validateCacheBlocks(6)).toThrow(/power of two/);
  });

  it("rejects block indices outside main memory", () => {
    expect(() => validateBlockSequence([-1])).toThrow(/0 to 1023/);
    expect(() => validateBlockSequence([1024])).toThrow(/0 to 1023/);
  });
});
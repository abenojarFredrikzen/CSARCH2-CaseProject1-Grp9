import { describe, expect, it } from "vitest";
import { simulateDirectMapped } from "../directMapped.js";
import { simulateFullyAssociativeMRU } from "../fullyAssociativeMRU.js";
import { simulateComparison } from "../simulate.js";
import {
  generateMidRepeatSequence,
  generateSequentialSequence,
} from "../traceGenerators.js";
import { READ_POLICIES } from "../validation.js";

const baseConfiguration = Object.freeze({
  cacheBlocks: 4,
  blockSize: 2,
  readPolicy: READ_POLICIES.LOAD_THROUGH,
  timing: {
    cacheAccessTime: 1,
    firstMemoryWordTime: 100,
    additionalWordTime: 10,
    unit: "ns",
  },
});

describe("Direct Mapped cache", () => {
  it("uses block modulo cache-block count and records conflict evictions", () => {
    const result = simulateDirectMapped({
      ...baseConfiguration,
      sequence: [0, 4, 0],
    });

    expect(result.events.map((event) => event.result)).toEqual([
      "miss",
      "miss",
      "miss",
    ]);
    expect(result.events.map((event) => event.lineIndex)).toEqual([0, 0, 0]);
    expect(result.events.map((event) => event.tag)).toEqual([0, 1, 0]);
    expect(result.events.map((event) => event.evictedBlock)).toEqual([
      null,
      0,
      4,
    ]);
    expect(result.finalCache[0]).toMatchObject({ block: 0, tag: 0 });
  });

  it("records a hit when the mapped line still contains the block", () => {
    const result = simulateDirectMapped({
      ...baseConfiguration,
      sequence: [3, 3],
    });

    expect(result.statistics).toMatchObject({
      totalAccesses: 2,
      cacheHits: 1,
      cacheMisses: 1,
    });
  });
});

describe("Fully Associative + MRU cache", () => {
  it("fills empty lines in deterministic index order", () => {
    const result = simulateFullyAssociativeMRU({
      ...baseConfiguration,
      sequence: [8, 9],
    });

    expect(result.events.map((event) => event.lineIndex)).toEqual([0, 1]);
    expect(result.finalCache.slice(0, 2).map((line) => line.block)).toEqual([
      8,
      9,
    ]);
  });

  it("evicts the block touched most recently", () => {
    const result = simulateFullyAssociativeMRU({
      ...baseConfiguration,
      sequence: [0, 1, 2, 3, 0, 4],
    });
    const eviction = result.events.at(-1);

    expect(eviction.result).toBe("miss");
    expect(eviction.evictedBlock).toBe(0);
    expect(eviction.lineIndex).toBe(0);
    expect(result.finalCache.map((line) => line.block)).toEqual([4, 1, 2, 3]);
    expect(result.finalCache[0].isMostRecentlyUsed).toBe(true);
  });
});

describe("Machine 8 golden results", () => {
  const n16Configuration = {
    ...baseConfiguration,
    cacheBlocks: 16,
    blockSize: 16,
  };

  it("matches the corrected two-pass sequential results", () => {
    const comparison = simulateComparison({
      ...n16Configuration,
      sequence: generateSequentialSequence(16),
    });

    expect(comparison.directMapped.statistics).toMatchObject({
      totalAccesses: 64,
      cacheHits: 0,
      cacheMisses: 64,
      cacheHitRate: 0,
    });
    expect(comparison.fullyAssociativeMRU.statistics).toMatchObject({
      totalAccesses: 64,
      cacheHits: 16,
      cacheMisses: 48,
      cacheHitRate: 25,
    });
  });

  it("matches the independently verified mid-repeat results", () => {
    const comparison = simulateComparison({
      ...n16Configuration,
      sequence: generateMidRepeatSequence(16),
    });

    expect(comparison.directMapped.statistics).toMatchObject({
      totalAccesses: 160,
      cacheHits: 16,
      cacheMisses: 144,
      cacheHitRate: 10,
    });
    expect(comparison.fullyAssociativeMRU.statistics).toMatchObject({
      totalAccesses: 160,
      cacheHits: 77,
      cacheMisses: 83,
      cacheHitRate: 48.125,
    });
  });

  it("keeps both engines synchronized to one immutable sequence", () => {
    const comparison = simulateComparison({
      ...baseConfiguration,
      sequence: [0, 1, 0, 4],
    });

    expect(Object.isFrozen(comparison.sequence)).toBe(true);
    expect(
      comparison.directMapped.events.map((event) => event.requestedBlock),
    ).toEqual(comparison.sequence);
    expect(
      comparison.fullyAssociativeMRU.events.map(
        (event) => event.requestedBlock,
      ),
    ).toEqual(comparison.sequence);
  });

  it("changes timing without changing hit and miss outcomes", () => {
    const shared = {
      cacheBlocks: 4,
      blockSize: 4,
      sequence: [0, 0],
      timing: {
        cacheAccessTime: 2,
        firstMemoryWordTime: 50,
        additionalWordTime: 5,
        unit: "ns",
      },
    };
    const loadThrough = simulateComparison({
      ...shared,
      readPolicy: READ_POLICIES.LOAD_THROUGH,
    });
    const nonLoadThrough = simulateComparison({
      ...shared,
      readPolicy: READ_POLICIES.NON_LOAD_THROUGH,
    });

    expect(loadThrough.directMapped.statistics).toMatchObject({
      cacheHits: 1,
      cacheMisses: 1,
      totalMemoryAccessTime: 54,
    });
    expect(nonLoadThrough.directMapped.statistics).toMatchObject({
      cacheHits: 1,
      cacheMisses: 1,
      totalMemoryAccessTime: 71,
    });
  });
});

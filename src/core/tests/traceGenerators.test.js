/**
 * Checks that every required access sequence matches the assignment rules.
 */

import { describe, expect, it } from "vitest";
import {
  generateMidRepeatSequence,
  generateRandomSequence,
  generateSequentialSequence,
} from "../traceGenerators.js";

describe("required trace generators", () => {
  it("generates the assignment's two-pass sequential example", () => {
    expect(generateSequentialSequence(4)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it("uses 4n total accesses for the sequential sequence", () => {
    expect(generateSequentialSequence(16)).toHaveLength(64);
  });

  it("generates the exact mid-repeat example", () => {
    expect(generateMidRepeatSequence(4)).toEqual([
      0, 1, 2, 3,
      0, 1, 2, 3, 4, 5, 6, 7,
      0, 1, 2, 3, 4, 5, 6, 7,
      3, 2, 1, 0,
      7, 6, 5, 4, 3, 2, 1, 0,
      7, 6, 5, 4, 3, 2, 1, 0,
    ]);
  });

  it("uses 10n total accesses for the mid-repeat sequence", () => {
    expect(generateMidRepeatSequence(16)).toHaveLength(160);
  });

  it("creates a reproducible 64-access random sequence", () => {
    // The same seed must repeat, while a different seed should change the list.
    const first = generateRandomSequence(20260803);
    const repeated = generateRandomSequence(20260803);
    const different = generateRandomSequence(20260804);

    expect(first).toHaveLength(64);
    expect(first).toEqual(repeated);
    expect(first).not.toEqual(different);
    expect(first.every((block) => block >= 0 && block <= 1023)).toBe(true);
  });

  it("rejects required traces that exceed main memory", () => {
    expect(() => generateSequentialSequence(1024)).toThrow(/1024-block main memory/);
  });
});
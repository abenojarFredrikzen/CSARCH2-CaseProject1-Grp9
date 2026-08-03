# Group 9 Machine 8 Cache Simulator

A web-based CSARCH2 cache-memory simulator comparing:

- Direct Mapped cache
- Fully Associative cache with Most Recently Used (MRU) replacement

The simulator uses the same configuration and immutable block-access sequence for both cache organizations so their results can be compared fairly.

## Foundation status

The engine foundation is implemented and covered by automated tests. The current web page is intentionally a small placeholder; the synchronized simulator interface is the next phase.

Implemented core features:

- Direct Mapped placement, tags, hits, misses, and conflict evictions
- Fully Associative placement and true MRU eviction
- Empty cache at the beginning of every simulation
- Sequential, Mid-repeat, and seeded Random trace generators
- Per-step immutable cache snapshots and compatible event records
- Required hit, miss, rate, average-time, and total-time statistics
- Load-through and Non-load-through timing calculations
- Input and main-memory boundary validation
- One comparison API that runs both engines against the same sequence

## Local setup

Requirements: a current Node.js installation and npm.

```bash
npm install
npm run dev
```

Run the correctness checks:

```bash
npm test
npm run build
```

## Required trace interpretation

Let `n` be the number of cache blocks.

### Sequential

Blocks `0` through `2n - 1` are accessed in two total passes:

```text
[0 ... 2n-1]
[0 ... 2n-1]
```

Total accesses: `4n`.

### Mid-repeat

```text
[0 ... n-1]
[0 ... 2n-1]
[0 ... 2n-1]
[n-1 ... 0]
[2n-1 ... 0]
[2n-1 ... 0]
```

Total accesses: `10n`.

### Random

The generator produces exactly 64 block indices from `0` to `1023`. A visible numeric seed makes the sequence reproducible and ensures that both cache organizations receive identical input.

## Verified golden results

For 16 cache blocks and an initially empty cache:

| Test | Organization | Hits | Misses | Hit rate |
|---|---|---:|---:|---:|
| Sequential (64 accesses) | Direct Mapped | 0 | 64 | 0% |
| Sequential (64 accesses) | Fully Associative + MRU | 16 | 48 | 25% |
| Mid-repeat (160 accesses) | Direct Mapped | 16 | 144 | 10% |
| Mid-repeat (160 accesses) | Fully Associative + MRU | 77 | 83 | 48.125% |

## Timing model

The assignment requires average and total memory-access times but does not provide timing constants or full formulas. The engine therefore keeps all timing values configurable and currently supplies clearly disclosed defaults.

Let:

- `C` = cache lookup/access time
- `M` = first main-memory word time
- `R` = each additional-word transfer time
- `B` = block size in words

```text
Hit                         = C
Load-through miss           = C + M
Non-load-through miss       = C + M + (B - 1)R + C
Total memory access time    = sum of every event's access time
Average memory access time  = total time / number of accesses
```

The defaults are `C = 1 ns`, `M = 100 ns`, and `R = 10 ns`. These are simulator assumptions and should be replaced if the instructor provides official course values.

## Core entry point

The interface can import the engine from `src/core/index.js`.

```js
import {
  READ_POLICIES,
  generateSequentialSequence,
  simulateComparison,
} from "./core/index.js";

const sequence = generateSequentialSequence(16);

const result = simulateComparison({
  sequence,
  cacheBlocks: 16,
  blockSize: 16,
  readPolicy: READ_POLICIES.LOAD_THROUGH,
});
```

The returned object contains the shared sequence and separate Direct Mapped and Fully Associative + MRU results. Each result includes its complete event history, final cache snapshot, statistics, and timing unit.

## Important constraint

Main memory contains 1,024 blocks. Because the required Sequential and Mid-repeat traces access through block `2n - 1`, those required trace generators accept at most 512 cache blocks. This is a mathematical consequence of the assignment's fixed main-memory size, not an arbitrary visualization limit.

## Remaining submission work

- Build the synchronized step-by-step/final-snapshot interface
- Add complete trace-log and statistics components
- Confirm timing assumptions with the instructor or lecture material
- Expand this README with the required three-test comparative analysis
- Capture screenshots and record the walkthrough
- Deploy the application and add the live and video links
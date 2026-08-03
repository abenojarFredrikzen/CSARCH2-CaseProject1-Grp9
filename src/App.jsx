import { useEffect, useMemo, useState } from "react";
import CacheGrid from "./components/CacheGrid.jsx";
import ConfigurationPanel from "./components/ConfigurationPanel.jsx";
import Legend from "./components/Legend.jsx";
import PlaybackControls from "./components/PlaybackControls.jsx";
import SequencePanel from "./components/SequencePanel.jsx";
import StatisticsPanel from "./components/StatisticsPanel.jsx";
import TraceLog from "./components/TraceLog.jsx";
import {
  READ_POLICIES,
  TRACE_TYPES,
  calculateStatistics,
  generateTrace,
  simulateComparison,
} from "./core/index.js";

const DEFAULT_CONFIGURATION = Object.freeze({
  blockSize: 16,
  cacheBlocks: 16,
  readPolicy: READ_POLICIES.LOAD_THROUGH,
  traceType: TRACE_TYPES.SEQUENTIAL,
  seed: 20260803,
  cacheAccessTime: 1,
  firstMemoryWordTime: 100,
  additionalWordTime: 10,
});

function createSimulation(configuration) {
  const normalized = {
    ...configuration,
    blockSize: Number(configuration.blockSize),
    cacheBlocks: Number(configuration.cacheBlocks),
    seed: Number(configuration.seed),
    cacheAccessTime: Number(configuration.cacheAccessTime),
    firstMemoryWordTime: Number(configuration.firstMemoryWordTime),
    additionalWordTime: Number(configuration.additionalWordTime),
  };
  const sequence = generateTrace({
    type: normalized.traceType,
    cacheBlocks: normalized.cacheBlocks,
    seed: normalized.seed,
  });
  const comparison = simulateComparison({
    sequence,
    cacheBlocks: normalized.cacheBlocks,
    blockSize: normalized.blockSize,
    readPolicy: normalized.readPolicy,
    timing: {
      cacheAccessTime: normalized.cacheAccessTime,
      firstMemoryWordTime: normalized.firstMemoryWordTime,
      additionalWordTime: normalized.additionalWordTime,
      unit: "ns",
    },
  });

  return Object.freeze({ configuration: normalized, comparison });
}

function App() {
  const [configuration, setConfiguration] = useState(DEFAULT_CONFIGURATION);
  const [simulation, setSimulation] = useState(() =>
    createSimulation(DEFAULT_CONFIGURATION),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState("step");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(650);
  const [error, setError] = useState("");

  const directEvents = simulation?.comparison.directMapped.events ?? [];
  const associativeEvents =
    simulation?.comparison.fullyAssociativeMRU.events ?? [];
  const totalSteps = simulation?.comparison.sequence.length ?? 0;
  const timingUnit = simulation?.comparison.directMapped.timingUnit ?? "ns";

  const directEvent = currentStep > 0 ? directEvents[currentStep - 1] : null;
  const associativeEvent =
    currentStep > 0 ? associativeEvents[currentStep - 1] : null;

  const directStatistics = useMemo(
    () => calculateStatistics(directEvents.slice(0, currentStep)),
    [directEvents, currentStep],
  );
  const associativeStatistics = useMemo(
    () => calculateStatistics(associativeEvents.slice(0, currentStep)),
    [associativeEvents, currentStep],
  );

  useEffect(() => {
    if (!isPlaying) return undefined;

    if (currentStep >= totalSteps) {
      setIsPlaying(false);
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCurrentStep((step) => Math.min(step + 1, totalSteps));
    }, speed);

    return () => window.clearTimeout(timer);
  }, [currentStep, isPlaying, speed, totalSteps]);

  function invalidateSimulation(nextConfiguration) {
    setConfiguration(nextConfiguration);
    setSimulation(null);
    setCurrentStep(0);
    setIsPlaying(false);
    setError("");
  }

  function runSimulation(event) {
    event.preventDefault();

    try {
      const nextSimulation = createSimulation(configuration);
      setSimulation(nextSimulation);
      setCurrentStep(viewMode === "final" ? nextSimulation.comparison.sequence.length : 0);
      setIsPlaying(false);
      setError("");
    } catch (simulationError) {
      setSimulation(null);
      setCurrentStep(0);
      setIsPlaying(false);
      setError(simulationError.message);
    }
  }

  function regenerateSeed() {
    invalidateSimulation({
      ...configuration,
      seed: Math.floor(Math.random() * 0x100000000),
    });
  }

  function changeViewMode(mode) {
    setViewMode(mode);
    setIsPlaying(false);
    setCurrentStep(mode === "final" ? totalSteps : 0);
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__content">
          <p className="eyebrow">CSARCH2 · Group 9 · Machine 8</p>
          <h1>Cache Memory Comparison Laboratory</h1>
          <p className="hero__description">
            Run the same block-access trace through Direct Mapped and Fully
            Associative + MRU caches, then inspect every placement, hit, miss,
            eviction, and timing result.
          </p>
        </div>
        <div className="hero__facts" aria-label="Simulation facts">
          <span><strong>1,024</strong> memory blocks</span>
          <span><strong>2</strong> cache organizations</span>
          <span><strong>1</strong> synchronized trace</span>
        </div>
      </header>

      <main>
        <ConfigurationPanel
          configuration={configuration}
          error={error}
          onChange={invalidateSimulation}
          onRegenerateSeed={regenerateSeed}
          onRun={runSimulation}
        />

        <SequencePanel
          sequence={simulation?.comparison.sequence ?? null}
          traceType={simulation?.configuration.traceType ?? configuration.traceType}
          seed={simulation?.configuration.seed ?? configuration.seed}
          currentStep={currentStep}
        />

        <PlaybackControls
          currentStep={currentStep}
          totalSteps={totalSteps}
          isPlaying={isPlaying}
          speed={speed}
          viewMode={viewMode}
          onPrevious={() => setCurrentStep((step) => Math.max(0, step - 1))}
          onNext={() => setCurrentStep((step) => Math.min(totalSteps, step + 1))}
          onTogglePlay={() => setIsPlaying((playing) => !playing)}
          onFinish={() => {
            setIsPlaying(false);
            setCurrentStep(totalSteps);
          }}
          onReset={() => {
            setIsPlaying(false);
            setCurrentStep(0);
          }}
          onSpeedChange={setSpeed}
          onViewModeChange={changeViewMode}
        />

        {simulation ? (
          <>
            <section className="comparison-section" aria-labelledby="cache-state-title">
              <div className="section-heading comparison-heading">
                <div>
                  <p className="section-kicker">Visual snapshot</p>
                  <h2 id="cache-state-title">Cache memory state</h2>
                </div>
                <Legend />
              </div>

              <div className="cache-comparison">
                <CacheGrid
                  title="Direct Mapped"
                  subtitle="Fixed line: block mod cache blocks"
                  accent="direct"
                  cacheBlocks={simulation.configuration.cacheBlocks}
                  event={directEvent}
                  finalCache={directEvent?.cacheSnapshot ?? null}
                  organization="direct"
                  currentStep={currentStep}
                />
                <CacheGrid
                  title="Fully Associative + MRU"
                  subtitle="Any line · evicts most recently used"
                  accent="associative"
                  cacheBlocks={simulation.configuration.cacheBlocks}
                  event={associativeEvent}
                  finalCache={associativeEvent?.cacheSnapshot ?? null}
                  organization="associative"
                  currentStep={currentStep}
                />
              </div>
            </section>

            <StatisticsPanel
              directStatistics={directStatistics}
              associativeStatistics={associativeStatistics}
              timingUnit={timingUnit}
            />

            <TraceLog
              directEvents={directEvents}
              associativeEvents={associativeEvents}
              currentStep={currentStep}
              timingUnit={timingUnit}
            />
          </>
        ) : (
          <section className="panel empty-panel results-placeholder">
            <p className="section-kicker">Results paused</p>
            <h2>Run the updated configuration</h2>
            <p>
              Previous results were cleared so the page never mixes an old trace
              with new settings.
            </p>
          </section>
        )}

        <section className="panel assumptions-panel" aria-labelledby="assumptions-title">
          <div>
            <p className="section-kicker">Model notes</p>
            <h2 id="assumptions-title">Simulation assumptions</h2>
          </div>
          <ul>
            <li>Every run starts with both caches empty.</li>
            <li>Both organizations receive the exact same immutable sequence.</li>
            <li>Direct Mapped uses line = block mod number of cache blocks.</li>
            <li>Fully Associative evicts the block accessed most recently when full.</li>
            <li>Block size changes capacity and timing, not block-index hit patterns.</li>
          </ul>
        </section>
      </main>

      <footer>
        <span>Group 9 · CSARCH2 Simulation Project</span>
        <span>Direct Mapped vs. Fully Associative + MRU</span>
      </footer>
    </div>
  );
}

export default App;

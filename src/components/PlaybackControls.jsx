export default function PlaybackControls({
  currentStep,
  totalSteps,
  isPlaying,
  speed,
  viewMode,
  onPrevious,
  onNext,
  onTogglePlay,
  onFinish,
  onReset,
  onSpeedChange,
  onViewModeChange,
}) {
  const hasSimulation = totalSteps > 0;
  const stepMode = viewMode === "step";

  return (
    <section className="panel playback-panel" aria-labelledby="playback-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="section-kicker">Synchronized trace</p>
          <h2 id="playback-title">Playback</h2>
        </div>
        <div className="mode-toggle" aria-label="Snapshot mode">
          <button
            type="button"
            className={stepMode ? "is-active" : ""}
            onClick={() => onViewModeChange("step")}
            disabled={!hasSimulation}
            aria-pressed={stepMode}
          >
            Step-by-step
          </button>
          <button
            type="button"
            className={!stepMode ? "is-active" : ""}
            onClick={() => onViewModeChange("final")}
            disabled={!hasSimulation}
            aria-pressed={!stepMode}
          >
            Final snapshot
          </button>
        </div>
      </div>

      <div className="playback-progress">
        <div className="progress-label">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{totalSteps === 0 ? "No active simulation" : `${Math.round((currentStep / totalSteps) * 100)}%`}</span>
        </div>
        <progress value={currentStep} max={Math.max(totalSteps, 1)} />
      </div>

      <div className="playback-actions">
        <button
          className="button button--secondary"
          type="button"
          onClick={onReset}
          disabled={!hasSimulation || currentStep === 0 || !stepMode}
        >
          Reset
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onPrevious}
          disabled={!hasSimulation || currentStep === 0 || !stepMode || isPlaying}
        >
          Previous
        </button>
        <button
          className="button button--primary"
          type="button"
          onClick={onTogglePlay}
          disabled={!hasSimulation || !stepMode || currentStep >= totalSteps}
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onNext}
          disabled={!hasSimulation || currentStep >= totalSteps || !stepMode || isPlaying}
        >
          Next
        </button>
        <button
          className="button button--secondary"
          type="button"
          onClick={onFinish}
          disabled={!hasSimulation || currentStep >= totalSteps || !stepMode}
        >
          Finish
        </button>

        <label className="speed-control" htmlFor="playback-speed">
          Speed
          <select
            id="playback-speed"
            value={speed}
            onChange={(event) => onSpeedChange(Number(event.target.value))}
            disabled={!hasSimulation || !stepMode}
          >
            <option value="1200">Slow</option>
            <option value="650">Normal</option>
            <option value="250">Fast</option>
          </select>
        </label>
      </div>
    </section>
  );
}


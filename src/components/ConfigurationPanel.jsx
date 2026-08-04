import {
  MAX_RANDOM_SEED,
  READ_POLICIES,
  TRACE_TYPES,
} from "../core/index.js";

// These labels are shown in the test-case menu.
const testLabels = {
  [TRACE_TYPES.SEQUENTIAL]: "Sequential",
  [TRACE_TYPES.MID_REPEAT]: "Mid-repeat",
  [TRACE_TYPES.RANDOM]: "Random (64 accesses)",
};

/**
 * Shows one reusable number input with a label and optional hint.
 */
function NumberField({ id, label, hint, value, min, step = 1, onChange }) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field__label">{label}</span>
      <input
        id={id}
        type="number"
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

/**
 * Shows all settings needed to start a cache comparison.
 */
export default function ConfigurationPanel({
  configuration,
  error,
  onChange,
  onRegenerateSeed,
  onRun,
}) {
  // Keep the other form values while changing one field.
  const update = (field, value) => onChange({ ...configuration, [field]: value });

  return (
    <section className="panel configuration-panel" aria-labelledby="configuration-title">
      <div className="section-heading">
        <div>
          <p className="section-kicker">Simulation input</p>
          <h2 id="configuration-title">Configure the cache</h2>
        </div>
        <span className="status-pill">Main memory: 1,024 blocks</span>
      </div>

      {/* Let the simulator show every input error in the red warning box. */}
      <form onSubmit={onRun} noValidate>
        <div className="configuration-grid">
          <NumberField
            id="block-size"
            label="Block size"
            hint="Words per block · power of two · minimum 2"
            min="2"
            value={configuration.blockSize}
            onChange={(value) => update("blockSize", value)}
          />

          <NumberField
            id="cache-blocks"
            label="Cache blocks"
            hint="Power of two · 4–512 for required traces"
            min="4"
            value={configuration.cacheBlocks}
            onChange={(value) => update("cacheBlocks", value)}
          />

          <label className="field" htmlFor="read-policy">
            <span className="field__label">Read policy</span>
            <select
              id="read-policy"
              value={configuration.readPolicy}
              onChange={(event) => update("readPolicy", event.target.value)}
            >
              <option value={READ_POLICIES.LOAD_THROUGH}>Load-through</option>
              <option value={READ_POLICIES.NON_LOAD_THROUGH}>
                Non-load-through
              </option>
            </select>
            <span className="field__hint">Changes timing, not hit/miss results</span>
          </label>

          <label className="field" htmlFor="test-case">
            <span className="field__label">Test case</span>
            <select
              id="test-case"
              value={configuration.traceType}
              onChange={(event) => update("traceType", event.target.value)}
            >
              {Object.entries(testLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span className="field__hint">All required assignment sequences</span>
          </label>
        </div>

        {configuration.traceType === TRACE_TYPES.RANDOM && (
          <div className="seed-row">
            <NumberField
              id="random-seed"
              label="Random seed"
              hint={`Reproducible integer from 0 to ${MAX_RANDOM_SEED}`}
              min="0"
              value={configuration.seed}
              onChange={(value) => update("seed", value)}
            />
            <button
              className="button button--secondary seed-button"
              type="button"
              onClick={onRegenerateSeed}
            >
              New seed
            </button>
          </div>
        )}

        <details className="timing-settings">
          <summary>Timing assumptions</summary>
          <p>
            Adjust these values to explore different cache and memory timing
            assumptions.
          </p>
          <div className="configuration-grid configuration-grid--timing">
            <NumberField
              id="cache-time"
              label="Cache access time (C)"
              min="0.01"
              step="0.01"
              value={configuration.cacheAccessTime}
              onChange={(value) => update("cacheAccessTime", value)}
            />
            <NumberField
              id="first-word-time"
              label="First memory word (M)"
              min="0.01"
              step="0.01"
              value={configuration.firstMemoryWordTime}
              onChange={(value) => update("firstMemoryWordTime", value)}
            />
            <NumberField
              id="additional-word-time"
              label="Additional word (R)"
              min="0"
              step="0.01"
              value={configuration.additionalWordTime}
              onChange={(value) => update("additionalWordTime", value)}
            />
          </div>
        </details>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <div className="form-actions">
          <button className="button button--primary" type="submit">
            Run comparison
          </button>
          <p>Each run starts with two empty caches and one shared sequence.</p>
        </div>
      </form>
    </section>
  );
}

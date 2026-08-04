/**
 * Makes empty lines for the cache display before playback starts.
 */
function EmptyCache(cacheBlocks, associative) {
  return Array.from({ length: cacheBlocks }, (_, lineIndex) => ({
    lineIndex,
    valid: false,
    block: null,
    tag: null,
    ...(associative
      ? { lastUsedAt: null, isMostRecentlyUsed: false }
      : {}),
  }));
}

/**
 * Shows one cache line and its current hit, miss, eviction, or MRU state.
 */
function CacheLine({ line, activeEvent, organization }) {
  const isActive = activeEvent?.lineIndex === line.lineIndex;
  const classes = ["cache-line"];

  // Add state classes so CSS can color the line correctly.
  if (!line.valid) classes.push("cache-line--empty");
  if (isActive) classes.push(`cache-line--${activeEvent.result}`);
  if (isActive && activeEvent.evictedBlock !== null) {
    classes.push("cache-line--eviction");
  }

  return (
    <li className={classes.join(" ")}>
      <div className="cache-line__heading">
        <span>Line {line.lineIndex}</span>
        {organization === "associative" && line.isMostRecentlyUsed && (
          <span className="mru-badge">MRU</span>
        )}
      </div>
      {line.valid ? (
        <dl className="cache-line__values">
          <div>
            <dt>Block</dt>
            <dd>{line.block}</dd>
          </div>
          <div>
            <dt>Tag</dt>
            <dd>{line.tag}</dd>
          </div>
        </dl>
      ) : (
        <p className="empty-label">Empty</p>
      )}
    </li>
  );
}

/**
 * Shows one full cache snapshot and the message for its current event.
 */
export default function CacheGrid({
  title,
  subtitle,
  accent,
  cacheBlocks,
  event,
  finalCache,
  organization,
  currentStep,
}) {
  const associative = organization === "associative";

  // Step zero uses empty lines because no event snapshot exists yet.
  const cache = finalCache ?? EmptyCache(cacheBlocks, associative);

  return (
    <article className={`cache-panel cache-panel--${accent}`}>
      <header className="cache-panel__header">
        <div>
          <p className="cache-panel__label">{subtitle}</p>
          <h3>{title}</h3>
        </div>
        {event ? (
          <span className={`result-badge result-badge--${event.result}`}>
            {event.result}
          </span>
        ) : (
          <span className="result-badge result-badge--idle">Empty cache</span>
        )}
      </header>

      <div className="event-explanation" aria-live="polite">
        {event ? (
          <>
            <strong>Step {currentStep}: Block {event.requestedBlock}</strong>
            <span>{event.message}</span>
          </>
        ) : (
          <>
            <strong>Ready to begin</strong>
            <span>Use Next or Play to process the first memory access.</span>
          </>
        )}
      </div>

      <ol className="cache-grid" aria-label={`${title} cache lines`}>
        {cache.map((line) => (
          <CacheLine
            key={line.lineIndex}
            line={line}
            activeEvent={event}
            organization={organization}
          />
        ))}
      </ol>
    </article>
  );
}
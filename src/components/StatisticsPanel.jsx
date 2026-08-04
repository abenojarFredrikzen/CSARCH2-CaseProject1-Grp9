/**
 * Makes long decimal values easier to read.
 */
function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(value);
}

/**
 * Shows the seven required statistics for one cache.
 */
function StatisticCard({ title, accent, statistics, timingUnit }) {
  const values = [
    ["Total memory accesses", statistics.totalAccesses],
    ["Cache hits", statistics.cacheHits],
    ["Cache misses", statistics.cacheMisses],
    ["Cache hit rate", `${formatNumber(statistics.cacheHitRate, 4)}%`],
    ["Cache miss rate", `${formatNumber(statistics.cacheMissRate, 4)}%`],
    [
      "Average memory access time",
      `${formatNumber(statistics.averageMemoryAccessTime, 4)} ${timingUnit}`,
    ],
    [
      "Total memory access time",
      `${formatNumber(statistics.totalMemoryAccessTime, 4)} ${timingUnit}`,
    ],
  ];

  return (
    <article className={`statistics-card statistics-card--${accent}`}>
      <h3>{title}</h3>
      <dl>
        {values.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}

/**
 * Shows both statistic cards and a short hit comparison.
 */
export default function StatisticsPanel({
  directStatistics,
  associativeStatistics,
  timingUnit,
}) {
  const hitDifference =
    associativeStatistics.cacheHits - directStatistics.cacheHits;

  // The message changes based on which cache has more hits so far.
  let comparisonMessage = "Both organizations currently have the same number of hits.";
  if (hitDifference > 0) {
    comparisonMessage = `Fully Associative + MRU currently has ${hitDifference} more ${hitDifference === 1 ? "hit" : "hits"}.`;
  } else if (hitDifference < 0) {
    const difference = Math.abs(hitDifference);
    comparisonMessage = `Direct Mapped currently has ${difference} more ${difference === 1 ? "hit" : "hits"}.`;
  }

  return (
    <section className="panel statistics-panel" aria-labelledby="statistics-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="section-kicker">Required outputs</p>
          <h2 id="statistics-title">Statistical comparison</h2>
        </div>
        <p className="comparison-summary">{comparisonMessage}</p>
      </div>

      <div className="statistics-grid">
        <StatisticCard
          title="Direct Mapped"
          accent="direct"
          statistics={directStatistics}
          timingUnit={timingUnit}
        />
        <StatisticCard
          title="Fully Associative + MRU"
          accent="associative"
          statistics={associativeStatistics}
          timingUnit={timingUnit}
        />
      </div>
    </section>
  );
}
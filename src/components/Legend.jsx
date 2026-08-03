export default function Legend() {
  return (
    <div className="legend" aria-label="Cache visualization legend">
      <span><i className="legend-dot legend-dot--hit" /> Hit</span>
      <span><i className="legend-dot legend-dot--miss" /> Miss</span>
      <span><i className="legend-dot legend-dot--eviction" /> Eviction</span>
      <span><i className="legend-dot legend-dot--mru" /> Most recently used</span>
    </div>
  );
}


import { useEffect, useRef } from "react";

function outcome(event) {
  if (!event) return "—";
  return event.result === "hit" ? "Hit" : "Miss";
}

function eviction(event) {
  if (!event || event.evictedBlock === null) return "—";
  return `Block ${event.evictedBlock}`;
}

export default function TraceLog({
  directEvents,
  associativeEvents,
  currentStep,
  timingUnit,
}) {

  const tableRef = useRef(null);

  useEffect(() => {
    if (tableRef.current && currentStep > 0) {
      const container = tableRef.current;
      const currentRow = container.querySelector(`tr.trace-row--current`);
      if (currentRow) {
        const containerRect = container.getBoundingClientRect();
        const rowRect = currentRow.getBoundingClientRect();

        const isAbove = rowRect.top < containerRect.top;
        const isBelow = rowRect.bottom > containerRect.bottom;

        if (isAbove || isBelow) {
          const offset =
            currentRow.offsetTop -
            container.clientHeight / 4 +
            currentRow.clientHeight / 4;

          container.scrollTo({
            top: offset,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentStep]);

  return (
    <section className="panel trace-panel" aria-labelledby="trace-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="section-kicker">Required output</p>
          <h2 id="trace-title">Complete trace log</h2>
        </div>
        <span className="status-pill">{directEvents.length} recorded steps</span>
      </div>

      <div className="table-scroll" tabIndex="0" ref={tableRef}>
        <table>
          <caption className="visually-hidden">
            Complete synchronized trace for both cache organizations
          </caption>
          <thead>
            <tr>
              <th rowSpan="2">Step</th>
              <th rowSpan="2">Block</th>
              <th colSpan="4" className="table-group table-group--direct">
                Direct Mapped
              </th>
              <th colSpan="4" className="table-group table-group--associative">
                Fully Associative + MRU
              </th>
            </tr>
            <tr>
              <th>Result</th>
              <th>Line</th>
              <th>Eviction</th>
              <th>Time</th>
              <th>Result</th>
              <th>Line</th>
              <th>Eviction</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {directEvents.map((directEvent, index) => {
              const associativeEvent = associativeEvents[index];
              const step = index + 1;
              const rowState =
                step === currentStep
                  ? "trace-row--current"
                  : step < currentStep
                    ? "trace-row--processed"
                    : "";

              return (
                <tr key={step} className={rowState}>
                  <th scope="row">{step}</th>
                  <td className="number-cell">{directEvent.requestedBlock}</td>
                  <td><span className={`log-result log-result--${directEvent.result}`}>{outcome(directEvent)}</span></td>
                  <td>{directEvent.lineIndex}</td>
                  <td>{eviction(directEvent)}</td>
                  <td>{directEvent.accessTime} {timingUnit}</td>
                  <td><span className={`log-result log-result--${associativeEvent.result}`}>{outcome(associativeEvent)}</span></td>
                  <td>{associativeEvent.lineIndex}</td>
                  <td>{eviction(associativeEvent)}</td>
                  <td>{associativeEvent.accessTime} {timingUnit}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}


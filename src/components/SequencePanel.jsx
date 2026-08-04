import { useEffect, useRef } from "react";

const traceNames = {
  sequential: "Sequential sequence",
  "mid-repeat": "Mid-repeat sequence",
  random: "Seeded random sequence",
};

export default function SequencePanel({
  sequence,
  traceType,
  seed,
  currentStep,
}) {

  const sequenceListRef = useRef(null);

  useEffect(() => {
    if (sequenceListRef.current && currentStep > 0) {
      const container = sequenceListRef.current;
      const currentElement = container.querySelector(`.sequence-token--current`);
      if (currentElement) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = currentElement.getBoundingClientRect();


        const isLeft = elementRect.left < containerRect.left;
        const isRight = elementRect.right > containerRect.right;

        if (isLeft || isRight) {
          const offset =
            currentElement.offsetLeft -
            container.clientWidth / 8 +
            currentElement.clientWidth / 8;

          container.scrollTo({
            left: offset,
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentStep]);

  if (!sequence) {
    return (
      <section className="panel empty-panel" aria-labelledby="sequence-title">
        <p className="section-kicker">Shared input</p>
        <h2 id="sequence-title">Access sequence</h2>
        <p>Choose valid settings and run the comparison to generate a sequence.</p>
      </section>
    );
  }

  return (
    <section className="panel sequence-panel" aria-labelledby="sequence-title">
      <div className="section-heading section-heading--compact">
        <div>
          <p className="section-kicker">Shared input</p>
          <h2 id="sequence-title">{traceNames[traceType]}</h2>
        </div>
        <div className="sequence-meta">
          <span>{sequence.length} accesses</span>
          {traceType === "random" && <span>Seed {seed}</span>}
        </div>
      </div>

      <ol className="sequence-list" aria-label="Generated block access sequence" ref={sequenceListRef}>
        {sequence.map((block, index) => {
          const step = index + 1;
          const state =
            step === currentStep
              ? "current"
              : step < currentStep
                ? "processed"
                : "upcoming";

          return (
            <li
              key={`${index}-${block}`}
              className={`sequence-token sequence-token--${state}`}
              aria-current={state === "current" ? "step" : undefined}
              title={`Step ${step}: block ${block}`}
            >
              {block}
            </li>
          );
        })}
      </ol>
    </section>
  );
}


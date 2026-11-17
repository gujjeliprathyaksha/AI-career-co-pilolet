import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Clock3, Code2, Flame, Play, Sparkles } from 'lucide-react';

export default function DailyMission({ completed, onComplete, onAsk }) {
  const [started, setStarted] = useState(false);

  function completeMission() {
    onComplete();
    setStarted(false);
  }

  return (
    <section className="mission section-pad" id="mission">
      <div className="mission-card">
        <div className="mission-copy">
          <span className="eyebrow"><Sparkles size={13} /> YOUR MISSION TODAY</span>
          <h2>{completed ? 'A win worth celebrating.' : 'Build a JavaScript To-Do App'}</h2>
          <p>
            Create a simple task list that lets you add, complete, and remove items.
            Keep the first version small, then make it your own.
          </p>
          <div className="mission-meta">
            <span><Flame size={14} /> Intermediate</span>
            <span><Clock3 size={14} /> 45 minutes</span>
            <span><Code2 size={14} /> JavaScript · DOM · Events</span>
          </div>
          <div className="mission-actions">
            {completed ? (
              <button className="button complete-button" disabled>
                <Check size={15} /> Mission complete
              </button>
            ) : started ? (
              <button className="button complete-button" onClick={completeMission}>
                <Check size={15} /> Mark mission complete
              </button>
            ) : (
              <button className="button primary" onClick={() => setStarted(true)}>
                <Play size={14} fill="currentColor" /> Start mission
              </button>
            )}
            <button className="button ghost-light" onClick={onAsk}>
              <Sparkles size={14} /> Ask Caro for help
            </button>
          </div>
          <motion.p
            className="mission-feedback"
            aria-live="polite"
            initial={false}
            animate={{ opacity: started || completed ? 1 : 0 }}
          >
            {completed
              ? 'You showed up for your future today. Your career readiness is up by 2%.'
              : 'Mission started — take it one small feature at a time.'}
          </motion.p>
        </div>
        <div className="mission-art" aria-hidden="true">
          <div className="mission-orbit">
            <span>{completed ? <Check size={48} /> : <Code2 size={48} />}</span>
            <i /><i /><i />
          </div>
          <div className="mission-task">
            <span><Code2 size={17} /></span>
            <div>
              <small>YOUR NEXT SMALL WIN</small>
              <b>Build something useful</b>
              <p>One task at a time</p>
            </div>
          </div>
          <span className="mission-ribbon">{completed ? 'MISSION COMPLETE' : 'ONE SMALL STEP TODAY'}</span>
        </div>
      </div>
    </section>
  );
}

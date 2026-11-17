import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowUpRight, Mic, Plus, Send, Sparkles, Volume2, VolumeX, X } from 'lucide-react';

const careerOptions = [
  'Frontend Development',
  'Backend Development',
  'AI & Machine Learning',
  'Data Analytics',
  'UI/UX Design',
  'Not Sure Yet'
];

const quickActions = [
  ['Explain this page', 'What is this page and how do I use it?'],
  ['What should I do next?', 'What should I do first?'],
  ['Create my roadmap', 'Create my learning roadmap.'],
  ["Today's mission", "Give me today's mission."],
  ['Practice interview', 'I want to prepare for an interview.'],
  ['Improve my resume', 'Help me create a resume.']
];

export default function CaroAssistant({
  Robot,
  pageName,
  currentPage,
  careerGoal,
  setCareerGoal,
  messages,
  busy,
  state,
  listening,
  input,
  setInput,
  onAsk,
  onVoice,
  onStopSpeaking,
  onNewConversation
}) {
  const [open, setOpen] = useState(() => localStorage.getItem('careerpilot-caro-welcome-seen') !== 'true');
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const hasUserMessages = messages.some(message => message.role === 'user');
  const end = useRef(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);

  useEffect(() => {
    if (!open) return undefined;
    function closeOnEscape(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  function close() {
    setOpen(false);
    localStorage.setItem('careerpilot-caro-welcome-seen', 'true');
  }

  function chooseCareer(option) {
    const goal = option === 'Not Sure Yet' ? '' : option;
    setCareerGoal(goal);
    onAsk(goal
      ? `I’m interested in ${goal}. Help me figure out a good first step.`
      : 'I’m not sure what career I want yet. Can you help me explore what might fit?');
  }

  function submit(event) {
    event.preventDefault();
    onAsk(input);
  }

  function speak(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
  }

  function toggleSpeech() {
    const enabled = !speechEnabled;
    setSpeechEnabled(enabled);
    if (enabled) {
      const latestReply = [...messages].reverse().find(message => message.role === 'assistant');
      if (latestReply) speak(latestReply.text);
    } else {
      onStopSpeaking();
    }
  }

  return (
    <div className="caro-assistant">
      <AnimatePresence>
        {open && (
          <motion.section
            className="caro-panel"
            role="dialog"
            aria-label="Chat with Caro"
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.2 }}
          >
            <header className="caro-panel-header">
              <span className="caro-panel-avatar"><Robot state={state} size="small" /></span>
              <span className="caro-panel-identity">
                <b>Caro</b>
                <small>Your AI Career Co-Pilot <i>● Online</i></small>
              </span>
              <button className="caro-panel-new" type="button" onClick={onNewConversation} aria-label="Start a new conversation" title="Start a new conversation">
                <Plus size={17} />
              </button>
              <button className="caro-panel-close" type="button" onClick={close} aria-label="Close Caro">
                <X size={18} />
              </button>
            </header>

            <div className="caro-panel-context">
              <span><i /> {state === 'listening' || listening ? 'Listening…' : busy ? 'Caro is thinking…' : state === 'speaking' ? 'Caro is responding…' : 'Here with you'}</span>
              <small>Viewing: {pageName}</small>
            </div>

            <div className="caro-panel-messages" aria-live="polite">
              {messages.map((message, index) => (
                <motion.article
                  className={`caro-panel-message ${message.role}`}
                  key={`${index}-${message.text.slice(0, 24)}`}
                  initial={{ opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.role === 'assistant' && <span className="caro-message-mark">✦</span>}
                  <div>
                    <p>{message.text}</p>
                    {message.action && (
                      <a
                        className="caro-action-link"
                        href={message.action.href}
                        onClick={close}
                      >
                        {message.action.label} <ArrowUpRight size={14} />
                      </a>
                    )}
                    {message.role === 'assistant' && (
                      <button className="caro-replay" type="button" onClick={() => speak(message.text)}>
                        <Volume2 size={12} /> Read aloud
                      </button>
                    )}
                  </div>
                </motion.article>
              ))}
              {busy && (
                <article className="caro-panel-message assistant">
                  <span className="caro-message-mark">✦</span>
                  <div className="caro-thinking">Caro is thinking <i /><i /><i /></div>
                </article>
              )}
              <div ref={end} />
            </div>

            {!hasUserMessages && !careerGoal && (
              <div className="caro-welcome">
                <span>What kind of career are you interested in?</span>
                <div>
                  {careerOptions.map(option => (
                    <button key={option} type="button" onClick={() => chooseCareer(option)}>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="caro-quick-actions" aria-label="Quick questions">
              <span><Sparkles size={12} /> QUICK START</span>
              <div>
                {quickActions.map(([label, prompt]) => (
                  <button key={label} type="button" onClick={() => onAsk(prompt)} disabled={busy}>
                    {label} <ArrowRight size={12} />
                  </button>
                ))}
              </div>
            </div>

            {listening && <p className="caro-listening-note" role="status">Listening… Caro will send your words when you finish.</p>}
            <form className="caro-panel-composer" onSubmit={submit}>
              <button type="button" onClick={onVoice} aria-label={listening ? 'Listening to your message' : 'Speak to Caro'} title="Speak to Caro">
                <Mic size={17} />
              </button>
              <input
                value={input}
                onChange={event => setInput(event.target.value)}
                placeholder="Ask Caro anything…"
                aria-label={`Ask Caro about ${currentPage}`}
              />
              <button
                className="caro-panel-send"
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </form>
            <div className="caro-panel-audio">
              <button type="button" onClick={toggleSpeech}>{speechEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />} Voice {speechEnabled ? 'on' : 'off'}</button>
              <button type="button" onClick={onStopSpeaking}>Stop speaking</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <button
        className={`caro-launcher ${open ? 'is-open' : ''}`}
        type="button"
        onClick={() => open ? close() : setOpen(true)}
        aria-label={open ? 'Close Caro assistant' : 'Open Caro assistant'}
        aria-expanded={open}
      >
        {open ? <X size={23} /> : <Robot state={state} size="small" />}
        {!open && <span className="caro-launcher-sparkle"><Sparkles size={12} /></span>}
      </button>
    </div>
  );
}

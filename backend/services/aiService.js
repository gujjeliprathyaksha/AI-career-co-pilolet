import dotenv from 'dotenv';

dotenv.config({ path: 'backend/.env' });

const key = process.env.AI_API_KEY;
const model = process.env.AI_MODEL || 'gpt-4o-mini';
const previewNote = '\n\nI’m in preview mode. Add an AI_API_KEY to the backend for personalized answers.';
const caroSystem = 'You are Caro, a friendly, patient, encouraging and professional AI career companion. Answer naturally in simple language, keep responses focused, explain technical ideas clearly, and use conversation context. Help with career planning, learning, programming, projects, resumes, interviews, job preparation, communication, and workplace questions. Answer general knowledge questions too. Ask a useful follow-up when needed. For unrelated or unsafe requests, set a polite boundary and redirect. Never invent credentials, metrics, or guaranteed job outcomes.';

async function generate(system, prompt) {
  if (!key) return null;
  const messages = Array.isArray(prompt) ? prompt : [{ role: 'user', content: prompt }];
  const response = await fetch(process.env.AI_API_URL || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: system }, ...messages], temperature: 0.7 })
  });
  if (!response.ok) throw new Error(`AI provider returned ${response.status}`);
  return (await response.json()).choices?.[0]?.message?.content || null;
}

const pageGuidance = {
  Home: 'Welcome to CareerPilot, your AI-powered career companion. Start with Caro, then explore your career progress, roadmap, daily mission, interview practice, resume builder, and skill recommendations.',
  'AI Coach': 'This is the AI Coach. Ask Caro about career choices, skills, programming, learning plans, projects, interviews, resumes, or job preparation. Share your goal and what you already know to get more useful guidance.',
  'Career Dashboard': 'This is your Career Dashboard. It brings together your readiness score, skill progress, learning momentum, completed missions, and interview practice. Use it to choose a small next step.',
  'Career Roadmap': 'This is your Career Roadmap. Choose a step to see what to learn, practice tasks, project ideas, and Caro’s tips. Use “Ask Caro to personalize it” to create a roadmap for your career goal.',
  'Daily Mission': 'This is your Daily Mission: a practical task to help turn learning into hands-on experience. Start the mission, work through one feature at a time, and mark it complete when you finish.',
  'AI Interview Room': 'This is your AI Interview Room. Draft or speak your answer to the current question, then request gentle feedback on communication, clarity, confidence, and technical detail.',
  'Resume Builder': 'This is your Resume Builder. Add your goal, skills, and real project or experience details; Caro can polish the wording and show it in the live preview. Review every detail so it stays accurate.',
  Skills: 'This is your Skills area. Review your current skill progress and the recommended next skill, then explore its topics and projects.'
};

function pageAction(message) {
  const text = message.toLowerCase();
  if (/\b(interview|mock interview)\b/.test(text) && /\b(take me|open|go to|start|practice|prepare|navigate|show me)\b/.test(text)) {
    return { label: 'Open AI Interview', href: '#interview' };
  }
  if (/\b(resume|cv)\b/.test(text) && /\b(open|go to|create|build|make|improve|write|help|show me|start)\b/.test(text)) {
    return { label: 'Open Resume Builder', href: '#resume' };
  }
  if (/\broadmap\b/.test(text) && /\b(open|go to|create|make|build|show me|start|personalize)\b/.test(text)) {
    return { label: 'Open my Career Roadmap', href: '#roadmap' };
  }
  if (/\bmission|today'?s task|daily task\b/.test(text) && /\b(open|go to|give|show|start|today)\b/.test(text)) {
    return { label: 'Open today’s mission', href: '#mission' };
  }
  if (/\bdashboard|career progress|readiness\b/.test(text) && /\b(open|go to|show|view|check|where)\b/.test(text)) {
    return { label: 'View my Career Dashboard', href: '#progress' };
  }
  if (/\bskill|learn next\b/.test(text) && /\b(open|go to|show|view|recommend|learn next)\b/.test(text)) {
    return { label: 'Explore my next skill', href: '#skill' };
  }
  return null;
}

function previewChat(message, history, currentPage, careerGoal) {
  const lower = message.toLowerCase();
  const previous = history.filter(item => item.role === 'user').at(-1)?.content;
  const context = [previous, message].filter(Boolean).join(' ').toLowerCase();
  let reply;

  if (/^(hi|hello|hey)\b/i.test(message.trim())) {
    reply = "Hi! 👋 I’m Caro, your Career Co-Pilot. I can help you understand CareerPilot, plan your career, create learning roadmaps, practice interviews, improve your resume, and answer your career questions. What would you like to explore?";
  } else if (/\b(this website|careerpilot|what can you do|features)\b/i.test(lower)) {
    reply = `CareerPilot is your AI-powered career companion. I can help you explore career paths, build a learning roadmap, track skills and progress, practice interviews, improve your resume, and plan hands-on projects. You’re currently viewing ${currentPage}; tell me a goal or choose a feature and I’ll help you get started.`;
  } else if (/\b(explain this page|what is this page|what can i do here|how do i use this|what is this)\b/i.test(lower)) {
    reply = pageGuidance[currentPage] || pageGuidance.Home;
  } else if (/\bwhat should i do first|what should i do next|where do i start|how do i start\b/i.test(lower)) {
    reply = careerGoal
      ? `Since you’re exploring ${careerGoal}, start by checking your roadmap and choosing the first skill you want to practice. If you’re not sure where you stand, tell me what you already know and how much time you have each week, and I’ll help you choose a comfortable first step.`
      : 'A good first step is to tell me what kinds of work interest you and what you enjoy doing. If you’re unsure, that’s completely okay—we can explore a few possibilities together. What do you like learning or making?';
  } else if (/\bconfused|don.t know what career|not sure what career|choose a career\b/i.test(lower)) {
    reply = 'It’s okay not to have it figured out yet. We can narrow things down without making a big commitment. What do you enjoy more: building things with code, working with data, designing experiences, or helping people solve problems? And what do you prefer to avoid?';
  } else if (/career (is )?right|which career|career fit|career path/i.test(lower)) {
    reply = 'A good-fit career usually sits where your interests, strengths, and preferred day-to-day work overlap. Try listing two activities that energize you, two skills people ask you for help with, and the kinds of problems you enjoy solving. If you share those, I can help compare a few paths and suggest a low-risk project to test one.';
  } else if (/roadmap|learning plan/i.test(lower)) {
    reply = 'For a frontend developer path, build in this order: strengthen HTML and CSS, practice JavaScript fundamentals, learn Git, then move into React and working with APIs. After that, make two polished projects, write up your process, and practice explaining your decisions. Aim for 30–45 minutes of focused practice most days; I can tailor the sequence to what you already know.';
  } else if (/\b(?:30|thirty)[ -]?day\b/i.test(lower) && /frontend|front.end|web developer/i.test(lower)) {
    reply = 'Here’s a practical 30-day frontend plan: Days 1–5, semantic HTML and accessible forms; days 6–10, CSS layout and responsive design; days 11–18, JavaScript fundamentals and DOM events; days 19–22, Git and a small interactive project; days 23–27, React components, props, state, and a small app; days 28–30, polish a portfolio project, write a clear README, and practice explaining your decisions. Aim for 30–60 minutes a day and adjust the pace to your schedule.';
  } else if (/\bwhat should i learn first|what do i learn first\b/i.test(lower)) {
    if (/html and css|know html|know css/.test(context)) {
      reply = 'Since you already know HTML and CSS, JavaScript is a good next step. Start with variables, functions, arrays, and objects, then use them to respond to events in the browser. What have you tried with JavaScript so far?';
    } else if (/frontend|front.end/.test(context)) {
      reply = 'For frontend development, start with semantic HTML and CSS fundamentals, then move into JavaScript. If you already know HTML and CSS, focus next on JavaScript variables, functions, arrays, and DOM events. What have you learned so far?';
    } else {
      reply = 'Start with the fundamentals that support your goal, then practice them in a small project. Tell me what career you’re aiming for and what you already know, and I’ll suggest a specific first topic.';
    }
  } else if (/^what is react\b/i.test(lower)) {
    reply = 'React is a JavaScript library for building user interfaces from reusable components. You describe what the screen should look like for the current data, and React updates it when that data changes. Components, props, and state are good concepts to learn first.';
  } else if (/react|what should i learn next|next skill/i.test(lower)) {
    reply = 'React is a practical next step if you’re comfortable with JavaScript basics. Start with components and JSX, then props and state, then hooks and API data. Build a small search or habit-tracker app as you learn so each concept has a place to stick.';
  } else if (/\bjavascript\b|explain (this )?code|programming\b/i.test(lower)) {
    reply = 'JavaScript is a programming language that adds behavior to websites. It can respond to clicks, validate forms, update content, and communicate with APIs. A helpful way to learn is to build a tiny interactive feature—such as a task list—and practice variables, functions, arrays, and events along the way.';
  } else if (/\bcan i get a job without experience|no experience|without experience\b/i.test(lower)) {
    reply = 'Yes, it’s possible to get an entry-level role without formal job experience, though it can take persistence. Build a couple of focused projects, explain your contribution clearly, practice interviews, and look for internships, junior roles, or adjacent experience. Be honest about what you’ve done and keep learning from feedback.';
  } else if (/\bimprove my english|improve english|english speaking\b/i.test(lower)) {
    reply = 'A little regular practice helps: read or listen to something short, summarize it aloud, and record yourself once or twice a week. For interviews, practice explaining a project in simple sentences. Clear communication matters more than using complicated words.';
  } else if (/interview|tell me about yourself/i.test(lower)) {
    reply = 'For “Tell me about yourself,” use a short present–past–future structure: what you’re focused on now, one relevant project or experience, and the kind of role you’re aiming for. Keep it to about a minute and include only details you can comfortably expand on. Want to draft an answer together?';
  } else if (/resume|cv|professional summary/i.test(lower)) {
    reply = 'A strong resume bullet leads with an action, names the work, and explains the value without inventing results. For example: “Built a responsive e-commerce site with product filtering and a streamlined browsing experience.” Share what you made, the tools you used, and any real outcome, and I’ll help polish it.';
  } else if (/project idea|project generator|build.*project/i.test(lower)) {
    reply = 'Try a small study-planner app: let someone add study sessions, group them by subject, and see what’s coming up next. Start with one screen and local data, then add filtering and responsive styling. It’s a useful way to show JavaScript, UI structure, and attention to detail.';
  } else if (/\b(plan|week|7.day|seven.day)\b/i.test(lower) && /react|frontend|javascript/i.test(context)) {
    reply = 'Here’s a focused 7-day React start: Day 1, set up a tiny app and render components; Day 2, pass props; Day 3, manage state; Day 4, handle forms and events; Day 5, use an effect to load sample data; Day 6, build a small search interface; Day 7, polish it and explain what you learned. Keep each session to one clear outcome.';
  } else if (previous && /\bhow many days|how long|how much time|it\b/i.test(lower) && /javascript|html|css|frontend|react/.test(context)) {
    const topic = /javascript/.test(context) ? 'JavaScript' : /react/.test(context) ? 'React' : /css/.test(context) ? 'CSS' : 'your next skill';
    reply = `If you can practice about 30–45 minutes most days, plan on roughly 3–4 weeks to build a useful JavaScript foundation. You can adjust the pace: focus on one concept each session, then use it in a small project. What have you tried so far?`;
    if (topic !== 'JavaScript') reply = reply.replace('JavaScript', topic);
  } else if (previous) {
    reply = `Building on what you shared about “${previous.slice(0, 140)},” choose one small next action you can finish today. What part would you like to work through first?`;
  } else {
    reply = `I can help with that. To make my answer useful, tell me a little more about what you’re trying to do${careerGoal ? ` for your ${careerGoal} goal` : ''}. We can break it into simple steps together.`;
  }

  return reply;
}

export async function chat({ message = '', history = [], currentPage = 'Home', currentRoute = '/', careerGoal = '' }) {
  currentPage = Object.hasOwn(pageGuidance, currentPage) ? currentPage : 'Home';
  currentRoute = /^\/[a-z-]{0,40}$/.test(currentRoute) ? currentRoute : '/';
  careerGoal = typeof careerGoal === 'string' ? careerGoal.slice(0, 120) : '';
  const context = `The user is currently viewing ${currentPage} at ${currentRoute}. ${pageGuidance[currentPage] || pageGuidance.Home}${careerGoal ? ` The user's stated career goal is ${careerGoal}.` : ''} If asked what this page is or how to use it, explain this specific page. If navigation would help, say so naturally; a navigation action may also be provided separately.`;
  const answer = await generate(`${caroSystem} ${context}`, [...history.slice(-20), { role: 'user', content: message }]);
  return { reply: answer || previewChat(message, history, currentPage, careerGoal), action: pageAction(message) };
}

export async function interview({ answer = '' }) {
  const out = await generate(caroSystem + ' Evaluate an interview answer kindly. Return JSON only: scores (Communication,Technical,Confidence,Clarity integers 0-100), good, improve, better.', answer);
  if (out) {
    try {
      return JSON.parse(out.replace(/```json|```/g, ''));
    } catch {}
  }
  return {
    scores: { Communication: 78, Technical: 82, Confidence: 74, Clarity: 85 },
    good: 'You shared a direct answer and showed interest in the role.',
    improve: 'Add a specific example and connect it to the opportunity you want.',
    better: 'I’m a frontend developer who enjoys turning complex ideas into clear, accessible experiences. Recently I built a responsive e-commerce project with JavaScript and CSS, focusing on product discovery and a smooth user journey.'
  };
}

export async function resume({ text = '', goal = 'Frontend Developer', name = '' }) {
  const out = await generate(caroSystem + ' Rewrite this as a concise, truthful, achievement-oriented resume bullet. Do not invent metrics or facts.', `Career goal: ${goal}\nName: ${name}\nText: ${text}`);
  return { content: out || `${text.replace(/[.]$/, '')}, creating a clear responsive experience aligned with ${goal.toLowerCase()} best practices.` };
}

export async function roadmap({ goal = 'Frontend Developer' }) {
  const out = await generate(caroSystem + ' Create a practical career roadmap as valid JSON array. Each object must include title, learn, topics (array), practice, projects (array), estimatedTime, and tip.', goal);
  if (out) {
    try {
      return { roadmap: JSON.parse(out.replace(/```json|```/g, '')) };
    } catch {}
  }

  return {
    roadmap: [
      { title: 'HTML', learn: 'Structure accessible pages with semantic HTML and meaningful form controls.', topics: ['Semantic elements', 'Forms', 'Accessibility'], practice: 'Build a profile page with a clear heading hierarchy and a contact form.', projects: ['Accessible profile page'], estimatedTime: '1 week', tip: 'Use elements for their meaning before adding visual styling.' },
      { title: 'CSS', learn: 'Create responsive layouts and a consistent visual system.', topics: ['Box model', 'Flexbox and Grid', 'Responsive design'], practice: 'Recreate a responsive card layout at mobile and desktop widths.', projects: ['Responsive portfolio landing page'], estimatedTime: '1–2 weeks', tip: 'Start with the small-screen layout, then add space as the viewport grows.' },
      { title: 'JavaScript', learn: 'Use core language features to make interfaces interactive.', topics: ['Variables and functions', 'Arrays and objects', 'DOM and events'], practice: 'Add, complete, and remove items from a task list.', projects: ['To-do app', 'Interactive quiz'], estimatedTime: '3–4 weeks', tip: 'Write small functions and test one behavior at a time.' },
      { title: 'Git/GitHub', learn: 'Track changes and share your work with a clear project history.', topics: ['Commits', 'Branches', 'Pull requests'], practice: 'Commit a feature in small steps and write a useful README.', projects: ['Documented portfolio repository'], estimatedTime: '1 week', tip: 'A good commit explains one meaningful change.' },
      { title: 'React', learn: 'Build interfaces from reusable components and manage changing data.', topics: ['Components and JSX', 'Props and state', 'Hooks'], practice: 'Create a searchable list with a controlled input and reusable item cards.', projects: ['Habit tracker', 'Product search app'], estimatedTime: '3–4 weeks', tip: 'Keep state close to the components that need it.' },
      { title: 'APIs', learn: 'Connect a user interface to remote data and handle loading and errors.', topics: ['HTTP basics', 'Fetch and JSON', 'Loading and error states'], practice: 'Display data from a public API with retry and empty states.', projects: ['Book finder'], estimatedTime: '1–2 weeks', tip: 'Design for slow or missing data, not just the happy path.' },
      { title: 'Portfolio projects', learn: 'Show how you turn a real user need into a finished, usable product.', topics: ['Scoping', 'Interaction design', 'Testing and polish'], practice: 'Ship one focused project and write a short case study about your decisions.', projects: ['Personal portfolio', 'Small product experience'], estimatedTime: '3–5 weeks', tip: 'A finished, focused project is stronger than a long feature list.' },
      { title: 'Resume', learn: 'Describe your skills and project contributions clearly and truthfully.', topics: ['Relevant skills', 'Project bullets', 'Readable formatting'], practice: 'Write two project bullets using action, work, and outcome.', projects: ['One-page role-focused resume'], estimatedTime: '1 week', tip: 'Use concrete details you can explain in an interview.' },
      { title: 'Interview', learn: 'Explain your experience and problem-solving with concise examples.', topics: ['Project walkthroughs', 'STAR stories', 'Practice questions'], practice: 'Record a one-minute introduction and refine it once.', projects: ['Interview story bank'], estimatedTime: '1–2 weeks', tip: 'Practice aloud, but keep your examples natural and specific.' },
      { title: 'Job search', learn: 'Find roles that fit your goals and follow up with care.', topics: ['Role research', 'Applications', 'Networking'], practice: 'Shortlist five relevant roles and tailor one application.', projects: ['Weekly application tracker'], estimatedTime: 'Ongoing', tip: 'Look for roles where your current strengths and next learning step overlap.' }
    ]
  };
}

export async function project({ skill = 'JavaScript', difficulty = 'Intermediate', interest = 'E-commerce' }) {
  const out = await generate(caroSystem + ' Create a portfolio project. Return valid JSON with name,description,features array,plan array,stack array,portfolioDescription.', JSON.stringify({ skill, difficulty, interest }));
  if (out) {
    try {
      return JSON.parse(out.replace(/```json|```/g, ''));
    } catch {}
  }
  return {
    name: 'ShopSense',
    description: `A thoughtful ${interest.toLowerCase()} experience built to make product discovery feel effortless.`,
    features: ['Search and category filters', 'Responsive product pages', 'Interactive cart with saved items'],
    plan: ['Sketch the main user flow and organize sample data', 'Build the core discovery and detail screens', 'Add interactions, test responsive states, and polish'],
    stack: [skill, 'HTML', 'CSS'],
    portfolioDescription: 'Built a responsive shopping experience with product discovery and an interactive cart.'
  };
}

export async function recommendation({ skills = ['JavaScript'], goal = 'Frontend Developer' }) {
  const out = await generate(caroSystem + ' Recommend one next skill with reason, learningTime, difficulty, topics, projects. Return JSON.', JSON.stringify({ skills, goal }));
  if (out) {
    try {
      return JSON.parse(out.replace(/```json|```/g, ''));
    } catch {}
  }
  return {
    skill: 'React',
    reason: 'Your JavaScript foundation is ready for a component-based UI library. React helps you build interactive interfaces that can grow with a product.',
    learningTime: '3–4 weeks',
    difficulty: 'Beginner friendly',
    topics: ['Components and JSX', 'Props and state', 'Hooks', 'Routing and APIs'],
    projects: ['Habit tracker', 'Product search app']
  };
}

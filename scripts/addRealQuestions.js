const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

// Curated high-quality internet-sourced questions
const realQuestions = {
  javascript: [
    {
      difficulty: 'hard',
      question: 'Scenario: We are sending a very large JSON dataset to the client at once, causing long initial load times. How do you improve this?',
      answer: 'Pagination, infinite scrolling (with IntersectionObserver), virtual scrolling (e.g., react-window), and lazy loading/code splitting are the best approaches. Alternatively, consider returning partial JSON (GraphQL or sparse fieldsets) and streaming the JSON.',
      code: null
    },
    {
      difficulty: 'medium',
      question: 'Scenario: A user is typing in a search input, and every keystroke triggers an API call. The server is getting overloaded. How do you fix it?',
      answer: 'Implement debouncing (waiting for a pause in typing) or Throttling (limiting the frequency of requests). Debouncing is usually best for search inputs so we only search after they stop typing.',
      code: `function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}`
    },
    {
      difficulty: 'hard',
      question: 'Scenario: You need to implement a deep clone function in JavaScript that handles circular references, Dates, and Maps. How do you approach this?',
      answer: 'We cannot use JSON.parse(JSON.stringify(obj)) because it loses Maps, Sets, Dates, and throws errors on circular references. The structuredClone API is modern and handles these natively. Alternatively, write a recursive function that keeps a WeakMap of visited objects to break circular references.',
      code: `const clone = structuredClone(original);`
    }
  ],
  react: [
    {
      difficulty: 'hard',
      question: 'Scenario: Our React application has become slow after adding several new features. How do you investigate and fix it?',
      answer: 'Use React DevTools Profiler to identify wasted renders. Implement React.memo for pure components, useMemo for expensive calculations, and useCallback to stabilize function references passed as props. Additionally, lazy load heavy components/routes and optimize asset sizes.',
      code: null
    },
    {
      difficulty: 'medium',
      question: 'Scenario: You have a profile page and a list page. Updating the user\'s name on the profile page should immediately update it on the list page. How do you manage this?',
      answer: 'Use centralized state management (Redux, Zustand, Context API) or server-state caching libraries (React Query/SWR) to ensure data synchronization across the application without prop drilling.',
      code: null
    }
  ],
  systemdesign: [
    {
      difficulty: 'hard',
      question: 'Scenario: How would you design a real-time dashboard that displays analytics for thousands of users?',
      answer: 'Use a Component-based architecture with WebSockets or Server-Sent Events (SSE) for real-time data streaming. Implement efficient state management (e.g., React Query, Redux) to handle frequent updates without freezing the UI, and utilize Canvas/WebGL-based charting libraries for data visualization performance.',
      code: null
    },
    {
      difficulty: 'hard',
      question: 'Scenario: How would you design an infinite scrolling feed (like Twitter)?',
      answer: 'API level: use Cursor-based pagination. UI level: use IntersectionObserver to detect when the user hits the bottom. Caching strategies and managing memory by cleaning up old data (DOM virtualization) are crucial so the browser does not crash.',
      code: null
    }
  ],
  dsa: [
    {
      difficulty: 'hard',
      question: 'Scenario: You need to implement an "Undo/Redo" feature in a text editor. Which data structure would you use and why?',
      answer: 'Two Stacks. One stack (undoStack) stores the history of states. The second stack (redoStack) stores states that were undone. When a user undoes, pop from undoStack and push to redoStack. When a new action is performed, clear the redoStack.',
      code: null
    }
  ],
  performance: [
    {
      difficulty: 'hard',
      question: 'Scenario: The initial JavaScript payload is 3MB, causing mobile browsers to freeze during parsing. How do you fix this?',
      answer: 'Implement route-based code splitting so the user only downloads the JS needed for the current page. Move heavy third-party libraries (e.g., moment.js) to dynamic imports or replace them with lighter alternatives. Ensure Tree Shaking is enabled in the bundler.',
      code: null
    }
  ],
  security: [
    {
      difficulty: 'hard',
      question: 'Scenario: You are building an SPA and need to store a JWT securely. Where do you store it to mitigate XSS and CSRF?',
      answer: 'Store the access token in an HttpOnly, Secure, SameSite=Strict cookie to protect against XSS (JavaScript cannot access it). Alternatively, keep it in memory and use a refresh token in an HttpOnly cookie to silently get new access tokens.',
      code: null
    }
  ]
};

// Also let's grab some questions from sudheerj's JS questions!
const githubJSQuestions = [
  {
    difficulty: 'medium',
    question: 'What is the difference between Call, Apply and Bind?',
    answer: 'Call invokes the function and allows you to pass in arguments one by one. Apply invokes the function and allows you to pass in arguments as an array. Bind returns a new function, allowing you to pass in a this array and any number of arguments.',
    code: null
  },
  {
    difficulty: 'medium',
    question: 'What is the Temporal Dead Zone (TDZ)?',
    answer: 'The Temporal Dead Zone is a behavior in JavaScript that occurs when declaring a variable with the let and const keywords, but not with var. In ECMAScript 6, accessing a let or const variable before its declaration (within its scope) causes a ReferenceError.',
    code: null
  },
  {
    difficulty: 'hard',
    question: 'Explain the event delegation model in JavaScript.',
    answer: 'Event delegation allows you to avoid adding event listeners to specific nodes; instead, the event listener is added to one common parent. It leverages event bubbling, where an event on a child node bubbles up to the parent.',
    code: null
  }
];

realQuestions.javascript.push(...githubJSQuestions);

Object.keys(realQuestions).forEach(topic => {
  const filePath = path.join(dataDir, `${topic}.js`);
  if (!fs.existsSync(filePath)) return;

  let fileContent = fs.readFileSync(filePath, 'utf8');
  
  // Extract existing questions array string
  // It looks like: window.JS_QUESTIONS = [ ... ];
  const match = fileContent.match(/window\.\w+\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    try {
      const existingArray = JSON.parse(match[1]);
      const newQuestions = realQuestions[topic].map(q => ({
        topic,
        difficulty: q.difficulty,
        question: q.question,
        answer: q.answer,
        code: q.code || null
      }));

      // Prepend to show up first!
      const mergedArray = [...newQuestions, ...existingArray];
      
      const newFileContent = fileContent.replace(match[1], JSON.stringify(mergedArray, null, 2));
      fs.writeFileSync(filePath, newFileContent, 'utf8');
      console.log(`Added ${newQuestions.length} real questions to ${topic}.js`);
    } catch (e) {
      console.error('Error parsing JSON in ' + topic, e);
    }
  }
});

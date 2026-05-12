const fs = require('fs');
const path = require('path');

const NUM_QUESTIONS = 300;
const OUTPUT_DIR = path.join(__dirname, '../data');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to get random item
const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const difficulties = ['easy', 'medium', 'medium', 'hard', 'hard', 'hard']; // Higher weight to medium/hard

function generateData(topicId, globalVarName, config) {
  const questions = [];
  const { concepts, questionTemplates, scenarioTemplates, codeTemplates } = config;

  for (let i = 0; i < NUM_QUESTIONS; i++) {
    const concept = sample(concepts);
    const difficulty = sample(difficulties);
    const isScenario = Math.random() > 0.4; // 60% chance for a scenario
    const templateList = isScenario && scenarioTemplates && scenarioTemplates.length > 0 ? scenarioTemplates : questionTemplates;
    const template = sample(templateList);
    
    let questionText = template.replace(/{concept}/g, concept.name);
    if (questionText.includes('{concept2}')) {
        const concept2 = sample(concepts.filter(c => c.name !== concept.name)) || concepts[0];
        questionText = questionText.replace(/{concept2}/g, concept2.name);
    }

    let answerText = "";
    if (isScenario) {
        answerText = `In this scenario involving ${concept.name}, the first step is to analyze the requirements and constraints. `;
        if (difficulty === 'hard') {
            answerText += `Because this is a complex situation, you should evaluate the edge cases and consider fallback strategies. For example, if ${concept.name} fails or causes bottlenecks, consider alternative patterns like state synchronization, throttling, or virtualization. `;
        }
        answerText += `Next, implement the solution ensuring best practices like error handling and performance optimization are in place. Use the STAR (Situation, Task, Action, Result) method to explain your thought process during an interview.`;
    } else {
        answerText = `When dealing with ${concept.name}, it is important to consider its core principles. ${concept.desc || ''} `;
        if (difficulty === 'medium') {
            answerText += `This is particularly useful when optimizing or structuring larger applications to avoid prop-drilling or excessive rendering. `;
        } else if (difficulty === 'hard') {
            answerText += `Advanced edge cases arise, requiring deep understanding of the internal mechanisms. Keep in mind performance and memory implications. `;
        }
        answerText += `Overall, mastering ${concept.name} enables developers to write robust and scalable solutions.`;
    }

    let codeSnippet = '';
    if (Math.random() > 0.6 && codeTemplates && codeTemplates.length > 0) {
        codeSnippet = sample(codeTemplates).replace(/{concept}/g, concept.name.replace(/[\s\(\)\/]/g, ''));
    }

    questions.push({
      topic: topicId,
      difficulty,
      question: questionText,
      answer: answerText,
      code: codeSnippet || null
    });
  }

  const fileContent = `window.${globalVarName} = ${JSON.stringify(questions, null, 2)};`;
  fs.writeFileSync(path.join(OUTPUT_DIR, `${topicId}.js`), fileContent);
  console.log(`Generated ${questions.length} questions for ${topicId}`);
}

// ------------------------------------------------------------------
// CONFIGURATIONS FOR EACH TOPIC
// ------------------------------------------------------------------

const jsConfig = {
    concepts: [
        { name: 'Closures', desc: 'A closure is the combination of a function bundled together with references to its surrounding state.' },
        { name: 'Promises', desc: 'The Promise object represents the eventual completion of an asynchronous operation.' },
        { name: 'Event Loop', desc: 'The event loop handles the execution of multiple chunks of your program over time.' },
        { name: 'DOM Manipulation', desc: 'Interacting with the Document Object Model using JavaScript.' },
        { name: 'Event Delegation', desc: 'Attaching a single event listener to a parent element to handle events on its children.' },
        { name: 'Debounce/Throttle', desc: 'Techniques to control the rate at which a function is executed.' },
        { name: 'WebSockets', desc: 'Full-duplex communication channels over a single TCP connection.' },
        { name: 'Fetch API', desc: 'Modern interface for fetching resources.' },
        { name: 'Web Storage', desc: 'localStorage and sessionStorage for saving data.' },
        { name: 'Service Workers', desc: 'Scripts that run in the background, intercepting network requests.' },
        { name: 'Prototypal Inheritance' }, { name: 'Hoisting' }, { name: 'Strict Mode' }, { name: 'Map/Set vs Objects/Arrays' }
    ],
    questionTemplates: [
        "Explain how {concept} works in JavaScript.",
        "Compare and contrast {concept} with {concept2}.",
        "What are the potential performance impacts of using {concept} incorrectly?",
        "How does {concept} interact with the JavaScript engine's memory management?"
    ],
    scenarioTemplates: [
        "Scenario: You are building an autocomplete search bar that triggers an API call on every keystroke, causing severe lag and API rate limiting. How would you solve this using {concept}?",
        "Scenario: A user is navigating your Single Page Application, but data isn't persisting when they refresh the page. How do you implement {concept} to fix this?",
        "Scenario: You need to implement an Infinite Scroll feature where new content loads as the user reaches the bottom of the page. Explain your approach using {concept}.",
        "Machine Coding: Build a custom Image Carousel/Slider. Explain how you would structure the JavaScript logic, paying attention to {concept}.",
        "Scenario: Your app is experiencing UI freezing while processing a large dataset. How would you use {concept} (e.g., Web Workers) to prevent blocking the main thread?",
        "Scenario: You have a dynamic list of thousands of items, and adding click listeners to each is consuming too much memory. How does {concept} help resolve this?",
        "Scenario: You need to fetch data from three different APIs simultaneously and combine the results into a single view. How would you structure this request efficiently using {concept}?",
        "Behavioral: Describe a time you had to handle a critical production issue related to {concept}. How did you troubleshoot it and what was the outcome?"
    ],
    codeTemplates: [
        "// Example scenario implementation for {concept}\nfunction handle{concept}() {\n  // Implementation\n}",
        "const {concept}Manager = {\n  init() {\n    // Setup logic\n  }\n};"
    ]
};

const angularConfig = {
    concepts: [{ name: 'Dependency Injection' }, { name: 'Observables' }, { name: 'Components' }, { name: 'Directives' }, { name: 'Pipes' }, { name: 'Services' }, { name: 'Routing' }, { name: 'Lazy Loading' }, { name: 'NgRx' }, { name: 'Change Detection' }, { name: 'Standalone Components' }, { name: 'Signals' }],
    questionTemplates: ["How do you implement {concept} in Angular?", "Explain the lifecycle hooks associated with {concept}."],
    scenarioTemplates: [
        "Scenario: Your Angular application's initial bundle size is 5MB, causing very slow load times. How do you use {concept} to optimize this?",
        "Scenario: You have deeply nested components that need to share state without passing inputs/outputs down the entire tree. How does {concept} solve this?",
        "Scenario: A specific component is causing the entire application to re-render constantly. How do you optimize {concept} (e.g., ChangeDetectionStrategy.OnPush) to fix this?",
        "Machine Coding: Create an Angular reactive form with custom async validators. How does {concept} play a role in managing the form state?",
        "Scenario: You need to integrate a third-party non-Angular library that heavily mutates the DOM. How do you use {concept} to prevent Change Detection errors?"
    ],
    codeTemplates: ["@Injectable({ providedIn: 'root' })\nexport class {concept}Service {\n  constructor() {}\n}"]
};

const reactConfig = {
    concepts: [{ name: 'Virtual DOM' }, { name: 'Hooks (useState, useEffect)' }, { name: 'useMemo / useCallback' }, { name: 'Context API' }, { name: 'Redux / Zustand' }, { name: 'React Hook Form' }, { name: 'React Router' }, { name: 'Server-Side Rendering (SSR)' }, { name: 'Suspense' }, { name: 'Error Boundaries' }, { name: 'React Window (Virtualization)' }, { name: 'TanStack Query' }],
    questionTemplates: ["What problem does {concept} solve in React?", "How do you optimize {concept} for better rendering performance?"],
    scenarioTemplates: [
        "Scenario: Your React application feels significantly slower after the latest set of features was added. How would you approach identifying and fixing the performance issues using {concept}?",
        "Scenario: You are tasked with displaying a massive list of data (e.g., 5,000+ items). How do you prevent the UI from freezing using {concept}?",
        "Scenario: You are building a complex form with 15+ input fields. You notice that every keystroke triggers a re-render of the entire component tree, causing UI lag. How would you handle this with {concept}?",
        "Scenario: A deeply nested component throws an unhandled exception, causing the entire React tree to unmount and showing a white screen. How do you implement {concept} to gracefully handle this?",
        "Scenario: How would you synchronize user profile data across multiple pages or components in your application without prop-drilling using {concept}?",
        "Machine Coding: Build a To-Do List Application in React. How do you manage the state using {concept}?",
        "Scenario: How do you decide whether a project should use Server-Side Rendering (SSR) versus Client-Side Rendering (CSR) when dealing with {concept}?"
    ],
    codeTemplates: ["import React, { useEffect, useState } from 'react';\n\nconst {concept}Component = () => {\n  return <div>{concept} active</div>;\n};"]
};

const awsConfig = {
    concepts: [{ name: 'EC2' }, { name: 'S3' }, { name: 'Lambda' }, { name: 'DynamoDB' }, { name: 'VPC' }, { name: 'IAM' }, { name: 'CloudFront' }, { name: 'RDS' }, { name: 'SQS' }, { name: 'CloudWatch' }, { name: 'API Gateway' }, { name: 'Route53' }],
    questionTemplates: ["Describe the primary use case for AWS {concept}.", "How do you secure {concept}?"],
    scenarioTemplates: [
        "Scenario: Your web application suddenly goes viral, and traffic spikes by 10,000%. Explain how {concept} fits into an auto-scaling architecture.",
        "Scenario: You need to process millions of image uploads asynchronously without blocking the user interface. Describe an architecture using {concept}.",
        "Scenario: Your company needs to serve static assets globally with sub-millisecond latency. How do you configure {concept} to achieve this?",
        "Scenario: You discover that your AWS bill has doubled over the weekend due to inefficient resource usage. How do you use {concept} to monitor and set alarms for billing anomalies?"
    ],
    codeTemplates: ["// Example using AWS SDK for {concept}\nconst client = new {concept}Client({ region: 'us-east-1' });"]
};

const dsaConfig = {
    concepts: [{ name: 'Arrays' }, { name: 'Linked Lists' }, { name: 'Stacks' }, { name: 'Queues' }, { name: 'Trees' }, { name: 'Graphs' }, { name: 'Hash Tables' }, { name: 'Sorting Algorithms' }, { name: 'Searching Algorithms' }, { name: 'Dynamic Programming' }, { name: 'Sliding Window' }, { name: 'Two Pointers' }],
    questionTemplates: ["What is the time complexity of common operations in {concept}?", "How would you implement {concept} from scratch?"],
    scenarioTemplates: [
        "Scenario: You need to implement an 'Undo/Redo' feature in a text editor. Which {concept} would you use and why?",
        "Scenario: You are building a real-time recommendation engine that needs to find the shortest path between user connections. How does {concept} help?",
        "Scenario: You need to quickly look up user data by their unique ID out of millions of records in memory. Explain why {concept} is the optimal choice.",
        "Machine Coding: Implement a feature that detects cyclical dependencies in a package manager. Which {concept} is required to solve this?"
    ],
    codeTemplates: ["class {concept} {\n  constructor() {\n    this.items = [];\n  }\n}"]
};

const debuggingConfig = {
    concepts: [{ name: 'Memory Leaks' }, { name: 'Race Conditions' }, { name: 'Deadlocks' }, { name: 'Stack Overflow' }, { name: 'Null Pointer Exceptions' }, { name: 'Network Timeouts' }, { name: 'Browser DevTools' }, { name: 'Log Analysis' }, { name: 'Performance Profiling' }, { name: 'Unit Testing' }, { name: 'Integration Tests' }, { name: 'Uncaught Promise Rejections' }],
    questionTemplates: ["What steps would you take to identify the root cause of {concept}?", "How do you reproduce intermittent {concept}?"],
    scenarioTemplates: [
        "Scenario: Users report that the web app becomes progressively slower if they leave the tab open for several hours. Walk me through how you would use {concept} to diagnose and fix this.",
        "Scenario: Two different asynchronous API calls occasionally finish in the wrong order, causing the UI to display outdated data. How do you debug and resolve this {concept}?",
        "Scenario: The application works perfectly on your local machine but crashes instantly in production. How do you approach this using {concept}?",
        "Scenario: You have inherited a large, legacy frontend codebase that lacks documentation and tests. How would you start the process of refactoring it using {concept}?",
        "Scenario: You and a teammate disagree on which technology stack or architectural approach to use to fix {concept}. How do you resolve this conflict?"
    ],
    codeTemplates: ["console.time('{concept}');\n// Debug logic\nconsole.timeEnd('{concept}');"]
};

const systemDesignConfig = {
    concepts: [{ name: 'Microservices' }, { name: 'Load Balancing' }, { name: 'Caching' }, { name: 'Database Sharding' }, { name: 'Message Queues' }, { name: 'CAP Theorem' }, { name: 'API Gateways' }, { name: 'CDN' }, { name: 'Event-Driven Architecture' }, { name: 'Rate Limiting' }, { name: 'Server-Sent Events (SSE)' }, { name: 'WebRTC' }],
    questionTemplates: ["How would you design a system that heavily relies on {concept}?", "What are the trade-offs of using {concept} in a high-traffic application?"],
    scenarioTemplates: [
        "Scenario: Design a Real-time Chat Application like WhatsApp. How does {concept} fit into handling millions of concurrent WebSocket connections?",
        "Scenario: You are designing an API for a public service that is getting abused by bots. How do you implement {concept} at the edge to protect your backend?",
        "Scenario: Your monolithic application takes 30 minutes to deploy and causes team conflicts. Explain how migrating to {concept} would solve these organizational and technical issues.",
        "Scenario: A massive database table has reached its read/write limits. Explain how you would implement {concept} to distribute the load globally without data loss."
    ],
    codeTemplates: ["// Architecture component: {concept}\nclass {concept}Manager {}"]
};

const securityConfig = {
    concepts: [{ name: 'XSS (Cross-Site Scripting)' }, { name: 'CSRF (Cross-Site Request Forgery)' }, { name: 'SQL Injection' }, { name: 'Authentication' }, { name: 'Authorization' }, { name: 'CORS' }, { name: 'Data Encryption' }, { name: 'OAuth' }, { name: 'JWT' }, { name: 'Rate Limiting (Security)' }, { name: 'Content Security Policy (CSP)' }, { name: 'Clickjacking' }],
    questionTemplates: ["Explain the mechanism behind {concept} attacks.", "What are the best practices for preventing {concept}?"],
    scenarioTemplates: [
        "Scenario: A user inputs a malicious script tag into a comment section, and it executes on other users' browsers. Explain this {concept} vulnerability and how to sanitize it.",
        "Scenario: An attacker manages to trick an authenticated user into submitting a state-changing request (like transferring funds) without their knowledge. How do you implement protections against this {concept}?",
        "Scenario: You are building an API that will be consumed by a separate frontend domain. Browsers are blocking the requests. How do you configure {concept} securely?",
        "Scenario: You need to implement a secure login system where users don't have to re-authenticate on every refresh. Describe how to securely handle {concept} tokens in the browser.",
        "Scenario: You are building a custom modal component. What steps must you take to ensure it is fully accessible and not vulnerable to {concept}?"
    ],
    codeTemplates: ["// Security measure for {concept}\nconst cleanInput = DOMPurify.sanitize(userInput);"]
};

const performanceConfig = {
    concepts: [{ name: 'Minification' }, { name: 'Tree Shaking' }, { name: 'Lazy Loading' }, { name: 'Code Splitting' }, { name: 'Web Vitals' }, { name: 'Critical Rendering Path' }, { name: 'Caching Strategies' }, { name: 'Image Optimization' }, { name: 'Bundle Size' }, { name: 'Prefetching' }, { name: 'WebP/AVIF formats' }, { name: 'CDN Usage' }],
    questionTemplates: ["How does {concept} impact the overall performance of a web application?", "What tools do you use to measure {concept}?"],
    scenarioTemplates: [
        "Scenario: Your website's Largest Contentful Paint (LCP) is over 4 seconds, failing Google's Core Web Vitals. Detail a strategy utilizing {concept} to bring it under 2.5 seconds.",
        "Scenario: The initial JavaScript payload is 3MB, causing mobile browsers to freeze during parsing. How do you implement {concept} to reduce the initial load?",
        "Scenario: You have a webpage with several large, high-resolution images that are causing long initial load times. Walk through an implementation of {concept} (like responsive images).",
        "Scenario: Users complain that returning to your site requires a full re-download of assets every day. Explain how you would configure {concept} (e.g., Cache-Control headers) to optimize this."
    ],
    codeTemplates: ["// Implementation of {concept}\nconst loadResource = async () => {\n  const module = await import('./module.js');\n};"]
};

// Generate all
generateData('javascript', 'JS_QUESTIONS', jsConfig);
generateData('angular', 'ANGULAR_QUESTIONS', angularConfig);
generateData('react', 'REACT_QUESTIONS', reactConfig);
generateData('aws', 'AWS_QUESTIONS', awsConfig);
generateData('dsa', 'DSA_QUESTIONS', dsaConfig);
generateData('debugging', 'DEBUGGING_QUESTIONS', debuggingConfig);
generateData('systemdesign', 'SYSTEMDESIGN_QUESTIONS', systemDesignConfig);
generateData('security', 'SECURITY_QUESTIONS', securityConfig);
generateData('performance', 'PERFORMANCE_QUESTIONS', performanceConfig);

console.log('All data generated successfully.');

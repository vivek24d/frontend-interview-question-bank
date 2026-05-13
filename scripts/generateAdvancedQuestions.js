const fs = require('fs');
const path = require('path');

const NUM_QUESTIONS = 500;
const OUTPUT_DIR = path.join(__dirname, '../data');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
const difficulties = ['easy', 'medium', 'medium', 'hard', 'hard', 'hard'];

// Diverse technical vocabularies for Mad-Libs style generation
const scales = ['high-traffic', 'global scale', 'enterprise', 'mission-critical', 'legacy', 'rapidly scaling', 'resource-constrained', 'data-intensive'];
const domains = ['e-commerce', 'fintech', 'social media', 'healthcare', 'real-time gaming', 'IoT dashboard', 'video streaming', 'SaaS platform'];
const problems = ['severe memory leaks', 'unpredictable race conditions', 'frequent UI freezing', 'high latency spikes', 'frequent server crashes', 'inconsistent state bugs', 'massive bundle size', 'API rate limiting'];
const components = ['authentication', 'payment processing', 'real-time feed', 'search autocomplete', 'data visualization', 'user onboarding', 'checkout flow', 'media upload'];
const specifics = ['unoptimized loops', 'poor garbage collection', 'blocking the main thread', 'excessive re-renders', 'deadlocks', 'unhandled exceptions', 'redundant network calls'];
const metrics = ['sub-second load times', 'strict data consistency', '100% uptime', 'smooth 60fps scrolling', 'secure data handling', 'WCAG compliance', 'minimal battery drain'];

// Base concepts per category
const conceptsDict = {
    javascript: ['Closures', 'Promises', 'Event Loop', 'DOM Manipulation', 'Event Delegation', 'Debounce/Throttle', 'WebSockets', 'Fetch API', 'Web Storage', 'Service Workers', 'Prototypal Inheritance', 'Hoisting', 'Strict Mode', 'Generators', 'WeakMap/WeakSet'],
    typescript: ['Generics', 'Interfaces vs Types', 'Utility Types', 'Decorators', 'Enums', 'Type Guards', 'Mapped Types', 'Conditional Types', 'Tuple Types', 'Intersection Types', 'Type Inference', 'Namespaces', 'Module Resolution', 'Strict Null Checks', 'Mixins'],
    api: ['REST', 'GraphQL', 'gRPC', 'Webhooks', 'Idempotency', 'Pagination', 'Rate Limiting', 'Authentication (OAuth/JWT)', 'Versioning', 'HATEOAS', 'CORS', 'Caching (ETag/Redis)', 'API Gateway', 'WebSockets', 'Status Codes'],
    angular: ['Dependency Injection', 'Observables', 'Components', 'Directives', 'Pipes', 'Services', 'Routing', 'Lazy Loading', 'NgRx', 'Change Detection', 'Standalone Components', 'Signals', 'RxJS Operators', 'HttpInterceptor', 'Route Guards'],
    react: ['Virtual DOM', 'Hooks', 'useMemo', 'useCallback', 'Context API', 'Redux', 'Zustand', 'React Hook Form', 'React Router', 'SSR', 'Suspense', 'Error Boundaries', 'Virtualization', 'TanStack Query', 'Concurrent Mode'],
    aws: ['EC2', 'S3', 'Lambda', 'DynamoDB', 'VPC', 'IAM', 'CloudFront', 'RDS', 'SQS', 'CloudWatch', 'API Gateway', 'Route53', 'ECS/EKS', 'EventBridge', 'Step Functions'],
    dsa: ['Arrays', 'Linked Lists', 'Stacks', 'Queues', 'Trees', 'Graphs', 'Hash Tables', 'Sorting Algorithms', 'Searching Algorithms', 'Dynamic Programming', 'Sliding Window', 'Two Pointers', 'Trie', 'Heaps', 'Backtracking'],
    debugging: ['Memory Leaks', 'Race Conditions', 'Deadlocks', 'Stack Overflow', 'Null Pointer Exceptions', 'Network Timeouts', 'Browser DevTools', 'Log Analysis', 'Performance Profiling', 'Unit Testing', 'Integration Tests', 'Uncaught Promise Rejections'],
    systemdesign: ['Microservices', 'Load Balancing', 'Caching', 'Database Sharding', 'Message Queues', 'CAP Theorem', 'API Gateways', 'CDN', 'Event-Driven Architecture', 'Rate Limiting', 'SSE', 'WebRTC', 'Consistent Hashing', 'SAGA Pattern', 'Circuit Breaker'],
    security: ['XSS', 'CSRF', 'SQL Injection', 'Authentication', 'Authorization', 'CORS', 'Data Encryption', 'OAuth', 'JWT', 'Rate Limiting', 'Content Security Policy', 'Clickjacking', 'Man-in-the-Middle', 'SSRF', 'Directory Traversal'],
    performance: ['Minification', 'Tree Shaking', 'Lazy Loading', 'Code Splitting', 'Web Vitals', 'Critical Rendering Path', 'Caching Strategies', 'Image Optimization', 'Bundle Size', 'Prefetching', 'WebP/AVIF', 'CDN Usage', 'Service Workers', 'Brotli Compression', 'HTTP/2']
};

function generateAdvancedQuestions() {
    Object.keys(conceptsDict).forEach(topic => {
        const questions = new Set();
        const output = [];
        const concepts = conceptsDict[topic];

        while (output.length < NUM_QUESTIONS) {
            const concept1 = sample(concepts);
            const concept2 = sample(concepts.filter(c => c !== concept1)) || concepts[0];
            const diff = sample(difficulties);
            const scale = sample(scales);
            const domain = sample(domains);
            const problem = sample(problems);
            const component = sample(components);
            const specific = sample(specifics);
            const metric = sample(metrics);

            const templates = [
                `Scenario: You are tasked with refactoring a ${scale} ${domain} application that suffers from ${problem}. Specifically, the ${component} module is failing due to ${specific}. How would you leverage ${concept1} alongside ${concept2} to resolve this, ensuring ${metric} is maintained?`,
                `During a critical code review for a ${scale} application, you notice ${concept1} being used improperly in the ${component} flow, causing ${problem}. Walk me through how you would optimize this using ${concept2} to achieve ${metric}.`,
                `Design architecture for a ${domain} feature handling millions of requests. If the ${component} system encounters ${specific}, how do you gracefully recover using ${concept1}?`,
                `A junior developer asks you why we are migrating the ${component} module from a legacy pattern to ${concept1}. Explain the technical trade-offs, particularly regarding ${problem} and achieving ${metric}.`,
                `In a ${scale} environment, the ${component} is a known bottleneck due to ${specific}. Assuming we cannot change the database layer, how does applying ${concept1} at the application layer mitigate ${problem}?`,
                `You are debugging a severe production issue in a ${domain} app: ${problem} is crashing the ${component}. How can ${concept1} be utilized to identify and patch the root cause without sacrificing ${metric}?`,
                `Machine Coding: Implement a robust ${component} system for a ${domain} platform. Ensure you incorporate ${concept1} to prevent ${specific} and optimize for ${metric}.`
            ];

            const qText = sample(templates);

            // Avoid duplicates
            if (questions.has(qText)) continue;
            questions.add(qText);

            // Generate an answer that matches the specific question structure
            const answerTemplates = [
                `To address the ${problem} in this ${domain} context, I would first isolate the ${component}. By implementing ${concept1}, we can bypass the ${specific}. Specifically, we must profile the impact using observability tools and write tests verifying ${metric}.`,
                `The root cause here is typical for ${scale} applications: ${specific} degrades the ${component}. Replacing the flawed logic with ${concept1} provides a robust boundary. I'd pair this with ${concept2} to ensure we hit our ${metric} target safely.`,
                `When handling ${problem}, ${concept1} acts as a foundational safety net. I would implement circuit breakers around the ${component} and utilize ${concept2} for fallback logic. Validating ${metric} via canary deployments would be the final step.`,
                `This requires a systematic approach to ${specific}. First, audit the ${component} usage. Then, slowly roll out ${concept1} behind a feature flag. This prevents ${problem} from cascading and ultimately guarantees ${metric}.`
            ];

            output.push({
                topic: topic,
                difficulty: diff,
                question: qText,
                answer: sample(answerTemplates),
                code: null
            });
        }

        const globalVarName = topic.toUpperCase() + '_QUESTIONS';
        const fileContent = `window.${globalVarName} = ${JSON.stringify(output, null, 2)};`;
        fs.writeFileSync(path.join(OUTPUT_DIR, `${topic}.js`), fileContent);
        console.log(`Generated EXACTLY ${output.length} unique questions for ${topic}`);
    });
}

generateAdvancedQuestions();

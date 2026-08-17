export interface ScreeningQuestionTemplate {
  questionText: string;
  expectedPoints: string;
}

export interface EvaluationResult {
  technicalScore: number;
  communicationScore: number;
  experienceScore: number;
  overallScore: number;
  summary: string;
  questionEvaluations: Array<{
    questionText: string;
    answerText: string;
    score: number;
    technicalAnalysis: string;
    communicationAnalysis: string;
    experienceAnalysis: string;
    explanation: string;
  }>;
}

export function generateScreeningQuestions(jobTitle: string, jobDescription: string): ScreeningQuestionTemplate[] {
  const isFrontend = jobTitle.toLowerCase().includes('front') || jobTitle.toLowerCase().includes('react') || jobTitle.toLowerCase().includes('ui');
  const isBackend = jobTitle.toLowerCase().includes('back') || jobTitle.toLowerCase().includes('java') || jobTitle.toLowerCase().includes('api');
  const isData = jobTitle.toLowerCase().includes('data') || jobTitle.toLowerCase().includes('science') || jobTitle.toLowerCase().includes('ai');

  if (isFrontend) {
    return [
      {
        questionText: 'Can you describe your experience with Next.js App Router and how it differs from Pages Router in terms of layouts and data fetching?',
        expectedPoints: 'Mention server vs client components, directory-based layouts, async fetch, loading.js, and server actions.',
      },
      {
        questionText: 'How do you approach state management in a large-scale React application? When would you use Context API vs Redux/Zustand?',
        expectedPoints: 'Discuss render frequency, performance issues, local state vs global state, and ease of debugging.',
      },
      {
        questionText: 'Describe how you optimize the loading speed and performance of a modern web application.',
        expectedPoints: 'Discuss image compression, code splitting, dynamic imports, Core Web Vitals, and caching strategies.',
      },
    ];
  } else if (isBackend) {
    return [
      {
        questionText: 'Explain your experience with microservices. How do you handle service discovery, communication, and database consistency?',
        expectedPoints: 'Mention REST, gRPC, message brokers (Kafka/RabbitMQ), transactional outbox pattern, and database-per-service.',
      },
      {
        questionText: 'How do you design database schemas for scalability and query speed? Provide an example of optimizing a slow query.',
        expectedPoints: 'Mention indexing, query plans (EXPLAIN), normalization/denormalization, and connection pooling.',
      },
      {
        questionText: 'How do you secure API endpoints against common vulnerabilities (e.g. SQL Injection, CSRF, rate limiting)?',
        expectedPoints: 'Explain prepared statements, CORS configuration, JWT signature validation, and rate limiter middleware.',
      },
    ];
  } else if (isData) {
    return [
      {
        questionText: 'Explain the workflow you use to prepare a dirty dataset for training an ML model.',
        expectedPoints: 'Mention handling null values, outlier detection, scaling/normalization, and feature engineering.',
      },
      {
        questionText: 'What is the difference between bagging and boosting algorithms? Give examples of both.',
        expectedPoints: 'Bagging is parallel (Random Forest); Boosting is sequential (XGBoost, LightGBM). Discuss bias vs variance.',
      },
      {
        questionText: 'How do you monitor and handle model drift once a model is deployed to production?',
        expectedPoints: 'Discuss tracking incoming data distributions, KS-tests, scheduled retraining, and logging pipelines.',
      },
    ];
  }

  // General fallback questions
  return [
    {
      questionText: `What is the most technically challenging problem you solved in your recent role related to ${jobTitle}?`,
      expectedPoints: 'Clear explanation of problem, options explored, chosen solution, and quantitative result.',
    },
    {
      questionText: 'Describe your favorite development tools, workflows, and testing processes that keep your code clean and deployable.',
      expectedPoints: 'Discuss git workflows, linting, unit testing, and CI/CD tools.',
    },
    {
      questionText: 'Explain how you collaborate with product managers, designers, and other stakeholders to turn requirements into code.',
      expectedPoints: 'Discuss communication skills, Agile methodologies, refining requirements, and code reviews.',
    },
  ];
}

export function evaluateAnswers(questions: string[], answers: string[]): EvaluationResult {
  const evaluations = questions.map((qText, idx) => {
    const ansText = answers[idx] || '';
    const wordCount = ansText.trim().split(/\s+/).filter(Boolean).length;

    // Simple robust evaluation heuristic
    let score = 50; // base score
    let technicalAnalysis = 'Contains basic concepts but lacks specific implementations or details.';
    let communicationAnalysis = 'Response is concise and structured, but could benefit from a structured example.';
    let experienceAnalysis = 'Shows familiarity with the topic but lacks deep project experience context.';

    if (wordCount < 10) {
      score = 25;
      technicalAnalysis = 'The response is too brief to evaluate technical depth.';
      communicationAnalysis = 'Extremely brief response, showing minimal effort in articulation.';
      experienceAnalysis = 'No professional context or experience was shared.';
    } else {
      // Analyze content keywords
      const lowerAns = ansText.toLowerCase();
      
      // Technical depth indicators
      const technicalKeywords = [
        'perform', 'scale', 'optimize', 'secure', 'design', 'architecture', 'database', 'rest', 
        'component', 'state', 'model', 'train', 'index', 'caching', 'server', 'async', 'thread',
        'pattern', 'api', 'deploy', 'testing', 'code', 'git', 'error', 'handle'
      ];
      
      let kwCount = 0;
      technicalKeywords.forEach(kw => {
        if (lowerAns.includes(kw)) kwCount++;
      });

      if (kwCount >= 5 && wordCount > 40) {
        score = 85 + Math.floor(Math.random() * 10);
        technicalAnalysis = 'Demonstrates strong technical understanding and correct terminology matching the scenario.';
        communicationAnalysis = 'The explanation is clear, logical, and structured with professional vocabulary.';
        experienceAnalysis = 'Response refers to real-world experience, illustrating actions taken and lessons learned.';
      } else if (kwCount >= 3 && wordCount > 25) {
        score = 70 + Math.floor(Math.random() * 12);
        technicalAnalysis = 'Shows a solid grasp of technical concepts and provides a clear description of mechanisms.';
        communicationAnalysis = 'The answer is coherent and understandable with minor formatting improvements needed.';
        experienceAnalysis = 'Indicates hands-on exposure to the tools and workflows discussed.';
      }
    }

    const explanation = `Evaluated at ${score}% based on response detail (${wordCount} words) and usage of job-related concepts.`;

    return {
      questionText: qText,
      answerText: ansText,
      score,
      technicalAnalysis,
      communicationAnalysis,
      experienceAnalysis,
      explanation,
    };
  });

  // Calculate aggregates
  const technicalScore = Math.round(evaluations.reduce((acc, curr) => acc + (curr.score * 1.05 > 100 ? 100 : curr.score * 1.05), 0) / evaluations.length);
  const communicationScore = Math.round(evaluations.reduce((acc, curr) => acc + (curr.score * 0.95), 0) / evaluations.length);
  const experienceScore = Math.round(evaluations.reduce((acc, curr) => acc + (curr.score * 0.98), 0) / evaluations.length);
  const overallScore = Math.round((technicalScore + communicationScore + experienceScore) / 3);

  let summary = 'The candidate has demonstrated partial fit for the position. They possess foundational knowledge but might require guidance in complex system design.';
  if (overallScore >= 85) {
    summary = 'Excellent screening session. The candidate demonstrated a deep technical understanding, spoke clearly with project context, and answered all questions with concrete details. Recommended for direct scheduling.';
  } else if (overallScore >= 70) {
    summary = 'Strong screening session. The candidate has comfortable experience with the required tool stack and communicates well. Ready for recruiter review and shortlisting.';
  } else if (overallScore < 50) {
    summary = 'The candidate struggled to articulately answer technical aspects of the role or gave responses that were too brief. Recommend passing on this applicant.';
  }

  return {
    technicalScore,
    communicationScore,
    experienceScore,
    overallScore,
    summary,
    questionEvaluations: evaluations,
  };
}

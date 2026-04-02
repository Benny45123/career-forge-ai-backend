const pdfParse = require('pdf-parse');
const { generateQuiz, evaluateAnswer } = require('../services/quizService');
const Quiz = require('../models/quizSchema');

const startQuiz = async (req, res) => {
  try {
    const resumeData = await pdfParse(req.file.buffer);
    const { jobDescription } = req.body;
    const result = await generateQuiz(resumeData.text, jobDescription, req.user.id);

    const saved = await Quiz.create({
      userId: req.user.id,
      questions: result.questions,
      jobDescription,
      status: 'in-progress'
    });

    // Send questions WITHOUT model answers to frontend
    const safeQuestions = result.questions.map(q => ({
      id: q.id, type: q.type, difficulty: q.difficulty,
      question: q.question, hint: q.hint
    }));

    res.status(200).json({ quizId: saved._id, questions: safeQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { quizId, questionId, userAnswer } = req.body;
    const quiz = await Quiz.findById(quizId);
    const question = quiz.questions.find(q => q.id === questionId);

    const evaluation = await evaluateAnswer(
      question.question, userAnswer, question.modelAnswer
    );

    // Save evaluation to quiz
    await Quiz.findByIdAndUpdate(quizId, {
      $push: { answers: { questionId, userAnswer, evaluation } }
    });
    // console.log(evaluation);
    res.status(200).json({ evaluation });
  } catch (err) {
    res.status(500).json({ error: 'Failed to evaluate answer' });
  }
};

const finishQuiz = async (req, res) => {
  try {
    const { quizId } = req.body;
    const quiz = await Quiz.findById(quizId).lean();

    const totalScore = quiz.answers.reduce((sum, a) => sum + a.evaluation.score, 0);
    const avgScore = Math.round((totalScore / (quiz.questions.length * 10)) * 100);

    await Quiz.findByIdAndUpdate(quizId, { status: 'completed', finalScore: avgScore });
    res.status(200).json({ finalScore: avgScore, answers: quiz.answers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to finish quiz' });
  }
};

module.exports = { startQuiz, submitAnswer, finishQuiz };
// controllers/quizController.js
// const pdfParse = require('pdf-parse');
// const { generateQuiz, evaluateAnswer } = require('../services/quizService');

// // In-memory store — replace with Redis/DB later
// const quizStore = new Map();

// const startQuiz = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'Resume file is required' });
//     }

//     const resumeData = await pdfParse(req.file.buffer);
//     const resumeText = resumeData.text;
//     const jobDescription = req.body.jobDescription || "";

//     const result = await generateQuiz(resumeText, jobDescription, req.user.id);

//     // Store questions with model answers server-side
//     const quizId = `quiz_${req.user.id}_${Date.now()}`;
//     quizStore.set(quizId, {
//       questions: result.questions,
//       answers: {},
//       scores: []
//     });

//     // Send questions to frontend WITHOUT modelAnswer
//     const safeQuestions = result.questions.map(({ modelAnswer, ...q }) => q);

//     res.status(200).json({ quizId, questions: safeQuestions });

//   } catch (error) {
//     console.error("Error starting quiz:", error);
//     res.status(500).json({ error: "Failed to generate quiz" });
//   }
// };

// const submitAnswer = async (req, res) => {
//   try {
//     const { quizId, questionId, userAnswer } = req.body;

//     if (!quizId || !questionId || !userAnswer) {
//       return res.status(400).json({ error: 'Missing required fields' });
//     }

//     const quiz = quizStore.get(quizId);
//     if (!quiz) {
//       return res.status(404).json({ error: 'Quiz not found or expired' });
//     }

//     const question = quiz.questions.find(q => q.id === questionId);
//     if (!question) {
//       return res.status(404).json({ error: 'Question not found' });
//     }

//     const evaluation = await evaluateAnswer(
//       question.question,
//       userAnswer,
//       question.modelAnswer  // kept server-side safely
//     );

//     // Store score
//     quiz.scores.push(evaluation.score);
//     quiz.answers[questionId] = { userAnswer, evaluation };

//     res.status(200).json({ evaluation });

//   } catch (error) {
//     console.error("Error submitting answer:", error);
//     res.status(500).json({ error: "Failed to evaluate answer" });
//   }
// };

// const finishQuiz = async (req, res) => {
//   try {
//     const { quizId } = req.body;

//     const quiz = quizStore.get(quizId);
//     if (!quiz) {
//       return res.status(404).json({ error: 'Quiz not found or expired' });
//     }

//     const scores = quiz.scores;
//     if (scores.length === 0) {
//       return res.status(400).json({ error: 'No answers submitted' });
//     }

//     const average = scores.reduce((a, b) => a + b, 0) / scores.length;
//     const finalScore = Math.round((average / 10) * 100);

//     // Cleanup memory
//     quizStore.delete(quizId);

//     res.status(200).json({ finalScore });

//   } catch (error) {
//     console.error("Error finishing quiz:", error);
//     res.status(500).json({ error: "Failed to finish quiz" });
//   }
// };

// module.exports = { startQuiz, submitAnswer, finishQuiz };
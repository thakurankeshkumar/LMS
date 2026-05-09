import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';

// Submit test (student)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'student') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const { testId, answers, timeTaken } = await request.json();

    // Check if test exists
    const test = await Test.findById(testId);
    if (!test) {
      return new Response(JSON.stringify({ message: 'Test not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if student already submitted
    const existingSubmission = await Submission.findOne({
      testId,
      studentId: session.user.id,
    });

    if (existingSubmission) {
      return new Response(JSON.stringify({ message: 'You have already submitted this test' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate score
    let score = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = test.questions[index];
      const isCorrect = answer.selectedOption === question.correctAnswer;
      if (isCorrect) {
        score += 10;
      }
      return {
        questionId: index.toString(),
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    const percentage = (score / test.totalMarks) * 100;

    const submission = new Submission({
      testId,
      studentId: session.user.id,
      answers: processedAnswers,
      score,
      totalMarks: test.totalMarks,
      percentage,
      timeTaken,
      startedAt: new Date(Date.now() - timeTaken * 1000),
    });

    await submission.save();

    return new Response(
      JSON.stringify({
        message: 'Test submitted successfully',
        submission,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Get submissions (teacher/student)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    let submissions;

    if (session.user.role === 'student') {
      submissions = await Submission.find({ studentId: session.user.id })
        .populate('testId', 'title')
        .sort('-submittedAt');
    } else if (session.user.role === 'teacher') {
      // Get all submissions for tests created by this teacher
      const tests = await Test.find({ teacherId: session.user.id });
      const testIds = tests.map((t) => t._id);

      submissions = await Submission.find({ testId: { $in: testIds } })
        .populate('testId', 'title')
        .populate('studentId', 'name email')
        .sort('-submittedAt');
    } else if (session.user.role === 'admin') {
      submissions = await Submission.find()
        .populate('testId', 'title')
        .populate('studentId', 'name email')
        .sort('-submittedAt');
    }

    return new Response(JSON.stringify({ submissions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

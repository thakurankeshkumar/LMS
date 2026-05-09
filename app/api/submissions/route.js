import { requireAuth } from '@/lib/api-auth';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';
import ArchivedTest from '@/lib/models/ArchivedTest';

// Submit test (student)
export async function POST(request) {
  try {
    const { user, response } = await requireAuth(['student']);

    if (response) {
      return response;
    }

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
      studentId: user._id,
    });

    if (existingSubmission) {
      return new Response(JSON.stringify({ message: 'You have already submitted this test' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Calculate score with optional negative marking
    let score = 0;
    const questionCount = test.questions?.length || 0;
    const questionMark = questionCount > 0 ? test.totalMarks / questionCount : 10;
    const penaltyPerWrong = (test.negativeMarkingPercent || 0) / 100 * questionMark;

    const processedAnswers = answers.map((answer, index) => {
      const question = test.questions[index];
      const isCorrect = answer.selectedOption === question.correctAnswer;

      if (isCorrect) {
        score += questionMark;
      } else if (answer.selectedOption !== null && answer.selectedOption !== undefined) {
        // attempted and wrong -> apply penalty if configured
        score -= penaltyPerWrong;
      }

      return {
        questionId: index.toString(),
        selectedOption: answer.selectedOption,
        isCorrect,
      };
    });

    if (score < 0) score = 0;

    const percentage = test.totalMarks > 0 ? (score / test.totalMarks) * 100 : 0;
    const passingMarks = test.passingMarks ?? (test.totalMarks * 40) / 100;
    const isPassed = score >= passingMarks;

    const submission = new Submission({
      testId,
      studentId: user._id,
      answers: processedAnswers,
      score,
      totalMarks: test.totalMarks,
      percentage,
      isPassed,
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
    const { user, response } = await requireAuth();

    if (response) {
      return response;
    }

    let submissions;

    if (user.role === 'student') {
        submissions = await Submission.find({ studentId: user._id })
          .populate('testId', 'title passingMarks totalMarks')
          .sort('-submittedAt');

        // Include archived test results for this student
        const archived = await ArchivedTest.find({ 'studentResults.studentId': user._id });
        const archivedMapped = archived.flatMap((a) => {
          const entry = a.studentResults.find((r) => r.studentId && r.studentId.toString() === user._id.toString());
          if (!entry) return [];
          return {
            _id: `archived_${a._id}`,
            archiveId: a._id,
            archived: true,
            testId: { title: a.title, _id: a.originalTestId, passingMarks: a.passingMarks },
            score: entry.score,
            totalMarks: entry.totalMarks,
            percentage: entry.percentage,
            isPassed: entry.passed,
            isApproved: true,
            submittedAt: entry.submittedAt,
            timeTaken: entry.timeTaken,
          };
        });

        // Merge and sort by submittedAt desc
        submissions = submissions
          .map((s) => ({ ...s.toObject(), archived: false }))
          .concat(archivedMapped)
          .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    } else if (user.role === 'teacher') {
      // Get all submissions for tests created by this teacher
      const tests = await Test.find({ teacherId: user._id });
      const testIds = tests.map((t) => t._id);

      submissions = await Submission.find({ testId: { $in: testIds } })
        .populate('testId', 'title passingMarks totalMarks')
        .populate('studentId', 'name email')
        .sort('-submittedAt');
    } else if (user.role === 'admin') {
      submissions = await Submission.find()
        .populate('testId', 'title passingMarks totalMarks')
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

import { requireAuth } from '@/lib/api-auth';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';
import User from '@/lib/models/User';

// Get student performance analytics
export async function GET(request, { params }) {
  try {
    const { user, response } = await requireAuth(['teacher']);

    if (response) {
      return response;
    }

    const { id } = await params; // student ID

    // Get all submissions for this student on tests created by this teacher
    const tests = await Test.find({ teacherId: user._id });
    const testIds = tests.map((t) => t._id);

    const submissions = await Submission.find({
      testId: { $in: testIds },
      studentId: id,
    })
      .populate('testId', 'title totalMarks passingMarks')
      .sort('-submittedAt');

    const student = await User.findById(id).select('name email');

    const totalTests = submissions.length;
    const passedTests = submissions.filter((s) => {
      const passMarks = s.testId?.passingMarks ?? (s.totalMarks * 40) / 100;
      return s.score >= passMarks;
    }).length;
    const averageScore = totalTests > 0 ? submissions.reduce((sum, s) => sum + s.score, 0) / totalTests : 0;
    const averagePercentage =
      totalTests > 0 ? submissions.reduce((sum, s) => sum + s.percentage, 0) / totalTests : 0;

    return new Response(
      JSON.stringify({
        student,
        performance: {
          totalTests,
          passedTests,
          failedTests: totalTests - passedTests,
          averageScore: averageScore.toFixed(2),
          averagePercentage: averagePercentage.toFixed(2),
        },
        submissions,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

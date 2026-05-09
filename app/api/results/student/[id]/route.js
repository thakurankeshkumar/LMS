import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';
import User from '@/lib/models/User';

// Get student performance analytics
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'teacher') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const { id } = await params; // student ID

    // Get all submissions for this student on tests created by this teacher
    const tests = await Test.find({ teacherId: session.user.id });
    const testIds = tests.map((t) => t._id);

    const submissions = await Submission.find({
      testId: { $in: testIds },
      studentId: id,
    })
      .populate('testId', 'title totalMarks passingMarks')
      .sort('-submittedAt');

    const student = await User.findById(id).select('name email');

    const totalTests = submissions.length;
    const passedTests = submissions.filter((s) => s.score >= s.totalMarks * 0.4).length;
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

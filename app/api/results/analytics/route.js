import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Test from '@/lib/models/Test';
import Submission from '@/lib/models/Submission';
import User from '@/lib/models/User';

// Get admin dashboard analytics
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalTeachers = await User.countDocuments({ role: 'teacher' });
    const totalTests = await Test.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const approvedSubmissions = await Submission.countDocuments({ isApproved: true });
    const pendingSubmissions = await Submission.countDocuments({ isApproved: false });

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('testId', 'title')
      .sort('-submittedAt')
      .limit(10);

    const analytics = {
      users: {
        total: totalUsers,
        students: totalStudents,
        teachers: totalTeachers,
      },
      tests: {
        total: totalTests,
      },
      submissions: {
        total: totalSubmissions,
        approved: approvedSubmissions,
        pending: pendingSubmissions,
      },
      recentSubmissions,
    };

    return new Response(JSON.stringify({ analytics }), {
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

import { requireAuth } from '@/lib/api-auth';
import Test from '@/lib/models/Test';
import Submission from '@/lib/models/Submission';
import User from '@/lib/models/User';
import ArchivedTest from '@/lib/models/ArchivedTest';

// Get admin dashboard analytics
export async function GET(request) {
  try {
    const { response } = await requireAuth(['admin']);

    if (response) {
      return response;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalTests,
      publishedTests,
      negativeMarkingEnabledTests,
      archivedTests,
      totalSubmissions,
      approvedSubmissions,
      pendingSubmissions,
      passedSubmissions,
      avgStats,
      activeStudentsIds,
      stalePendingSubmissions,
      topTestsBySubmissions,
      recentUsers,
      recentTests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Test.countDocuments(),
      Test.countDocuments({ isPublished: true }),
      Test.countDocuments({ negativeMarkingPercent: { $gt: 0 } }),
      ArchivedTest.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({ isApproved: true }),
      Submission.countDocuments({ isApproved: false }),
      Submission.countDocuments({ isPassed: true }),
      Submission.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            avgPercentage: { $avg: '$percentage' },
          },
        },
      ]),
      Submission.distinct('studentId', { submittedAt: { $gte: sevenDaysAgo } }),
      Submission.countDocuments({ isApproved: false, submittedAt: { $lte: sevenDaysAgo } }),
      Submission.aggregate([
        {
          $group: {
            _id: '$testId',
            submissions: { $sum: 1 },
            avgPercentage: { $avg: '$percentage' },
          },
        },
        { $sort: { submissions: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'tests',
            localField: '_id',
            foreignField: '_id',
            as: 'test',
          },
        },
        {
          $project: {
            _id: 1,
            submissions: 1,
            avgPercentage: { $round: ['$avgPercentage', 2] },
            title: { $ifNull: [{ $arrayElemAt: ['$test.title', 0] }, 'Deleted Test'] },
          },
        },
      ]),
      User.find()
        .select('name email role isActive createdAt')
        .sort('-createdAt')
        .limit(6),
      Test.find()
        .populate('teacherId', 'name email')
        .sort('-createdAt')
        .limit(6),
    ]);

    const avgScore = avgStats[0]?.avgScore ?? 0;
    const avgPercentage = avgStats[0]?.avgPercentage ?? 0;
    const passRate = totalSubmissions > 0 ? (passedSubmissions / totalSubmissions) * 100 : 0;
    const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;
    const inactiveUsers = await User.countDocuments({ isActive: false });

    const alerts = [];
    if (pendingSubmissions > 0) {
      alerts.push({
        type: 'warning',
        title: 'Pending reviews need attention',
        message: `${pendingSubmissions} submission${pendingSubmissions === 1 ? '' : 's'} are waiting for review.`,
      });
    }
    if (stalePendingSubmissions > 0) {
      alerts.push({
        type: 'error',
        title: 'Stale submissions',
        message: `${stalePendingSubmissions} pending submission${stalePendingSubmissions === 1 ? '' : 's'} are older than 7 days.`,
      });
    }
    if (inactiveUsers > 0) {
      alerts.push({
        type: 'info',
        title: 'Inactive accounts',
        message: `${inactiveUsers} user${inactiveUsers === 1 ? '' : 's'} are currently inactive.`,
      });
    }
    if (negativeMarkingEnabledTests === 0) {
      alerts.push({
        type: 'info',
        title: 'No negative-marking tests',
        message: 'All published tests currently use standard scoring only.',
      });
    }

    // Get recent submissions
    const recentSubmissions = await Submission.find()
      .populate('studentId', 'name email')
      .populate('testId', 'title passingMarks')
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
        published: publishedTests,
        unpublished: totalTests - publishedTests,
        negativeMarkingEnabled: negativeMarkingEnabledTests,
        archived: archivedTests,
      },
      submissions: {
        total: totalSubmissions,
        approved: approvedSubmissions,
        pending: pendingSubmissions,
        passed: passedSubmissions,
        passRate: Number(passRate.toFixed(2)),
        approvalRate: Number(approvalRate.toFixed(2)),
        stalePendingOver7Days: stalePendingSubmissions,
        averageScore: Number(avgScore.toFixed(2)),
        averagePercentage: Number(avgPercentage.toFixed(2)),
      },
      activity: {
        activeStudentsLast7Days: activeStudentsIds.length,
        inactiveUsers,
      },
      topTestsBySubmissions,
      recentUsers,
      recentTests,
      alerts,
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

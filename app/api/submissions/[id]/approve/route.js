import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';

// Approve result (teacher)
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'teacher') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const { id } = await params;
    const { remarks } = await request.json();

    const submission = await Submission.findById(id).populate('testId');

    if (!submission) {
      return new Response(JSON.stringify({ message: 'Submission not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify teacher owns the test
    const test = await Test.findById(submission.testId);
    if (test.teacherId.toString() !== session.user.id) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    submission.isApproved = true;
    submission.status = 'approved';
    submission.approvedBy = session.user.id;
    submission.approvalDate = new Date();
    if (remarks) submission.remarks = remarks;

    await submission.save();

    return new Response(
      JSON.stringify({
        message: 'Result approved successfully',
        submission,
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

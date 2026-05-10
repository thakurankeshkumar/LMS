import { requireAuth } from '@/lib/api-auth';
import Submission from '@/lib/models/Submission';
import Test from '@/lib/models/Test';

// Approve result (teacher)
export async function POST(request, { params }) {
  try {
    const { user, response } = await requireAuth(['teacher']);

    if (response) {
      return response;
    }

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
    const testRefId = submission?.testId?._id || submission?.testId;
    const test = testRefId ? await Test.findById(testRefId) : null;
    if (!test || test.teacherId.toString() !== user._id.toString()) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    submission.isApproved = true;
    submission.status = 'approved';
    submission.approvedBy = user._id;
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

import { requireAuth } from '@/lib/api-auth';
import Submission from '@/lib/models/Submission';

// Get single submission
export async function GET(request, { params }) {
  try {
    const { user, response } = await requireAuth();

    if (response) {
      return response;
    }

    const { id } = await params;
    const submission = await Submission.findById(id)
      .populate('testId')
      .populate('studentId', 'name email')
      .populate('approvedBy', 'name email');

    if (!submission) {
      return new Response(JSON.stringify({ message: 'Submission not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check authorization
    if (
      user.role === 'student' &&
      submission.studentId._id.toString() !== user._id.toString()
    ) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ submission }), {
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

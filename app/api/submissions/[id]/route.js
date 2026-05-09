import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Submission from '@/lib/models/Submission';

// Get single submission
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

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
      session.user.role === 'student' &&
      submission.studentId._id.toString() !== session.user.id
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

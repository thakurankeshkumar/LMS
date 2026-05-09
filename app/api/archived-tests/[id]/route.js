import { requireAuth } from '@/lib/api-auth';
import ArchivedTest from '@/lib/models/ArchivedTest';

// Get archived test result for a student (or teacher viewing own test)
export async function GET(request, { params }) {
  try {
    const { user, response } = await requireAuth();

    if (response) return response;

    const { id } = await params; // archived id

    const archived = await ArchivedTest.findById(id).populate('teacherId', 'name email');

    if (!archived) {
      return new Response(JSON.stringify({ message: 'Archived test not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If student, return only their result
    if (user.role === 'student') {
      const entry = archived.studentResults.find((r) => r.studentId && r.studentId.toString() === user._id.toString());
      if (!entry) {
        return new Response(JSON.stringify({ message: 'Result not found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({ archived, result: entry }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // If teacher, ensure they own the test
    if (user.role === 'teacher' && archived.teacherId.toString() !== user._id.toString()) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ archived }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

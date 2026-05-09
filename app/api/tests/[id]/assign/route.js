import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Test from '@/lib/models/Test';

// Assign test to students
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
    const { studentIds } = await request.json();

    if (!studentIds || studentIds.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Please provide at least one student' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const test = await Test.findById(id);

    if (!test) {
      return new Response(JSON.stringify({ message: 'Test not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (test.teacherId.toString() !== session.user.id) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Add students to assignedStudents (avoid duplicates)
    const newStudents = studentIds.filter(
      (id) => !test.assignedStudents.includes(id)
    );

    test.assignedStudents.push(...newStudents);
    await test.save();

    return new Response(
      JSON.stringify({
        message: 'Test assigned successfully',
        test,
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

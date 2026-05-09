import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import Test from '@/lib/models/Test';

// Get all tests for teacher or all published tests for student
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    let tests;

    if (session.user.role === 'teacher') {
      tests = await Test.find({ teacherId: session.user.id }).populate('teacherId', 'name email');
    } else if (session.user.role === 'student') {
      tests = await Test.find({
        isPublished: true,
        assignedStudents: session.user.id,
      }).populate('teacherId', 'name email');
    } else if (session.user.role === 'admin') {
      tests = await Test.find().populate('teacherId', 'name email');
    }

    return new Response(JSON.stringify({ tests }), {
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

// Create new test (teacher)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'teacher') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const { title, description, duration, questions, passingMarks } = await request.json();

    if (!title || !duration || !questions || questions.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Please provide all required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const test = new Test({
      title,
      description,
      duration,
      questions,
      teacherId: session.user.id,
      totalMarks: questions.length * 10,
      passingMarks: passingMarks || (questions.length * 10 * 40) / 100,
    });

    await test.save();

    return new Response(
      JSON.stringify({
        message: 'Test created successfully',
        test,
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

import { requireAuth } from '@/lib/api-auth';
import Test from '@/lib/models/Test';

// Get all tests for teacher or all published tests for student
export async function GET(request) {
  try {
    const { user, response } = await requireAuth();

    if (response) {
      return response;
    }

    let tests;

    if (user.role === 'teacher') {
      tests = await Test.find({ teacherId: user._id }).populate('teacherId', 'name email');
    } else if (user.role === 'student') {
      tests = await Test.find({
        isPublished: true,
        assignedStudents: user._id,
      }).populate('teacherId', 'name email');
    } else if (user.role === 'admin') {
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
    const { user, response } = await requireAuth(['teacher']);

    if (response) {
      return response;
    }

    const { title, description, duration, questions, passingMarks, negativeMarkingPercent } = await request.json();
    const normalizedNegativeMarking = Math.max(
      0,
      Number(negativeMarkingPercent || 0) > 0 && Number(negativeMarkingPercent || 0) <= 1
        ? Number(negativeMarkingPercent || 0) * 100
        : Number(negativeMarkingPercent || 0)
    );

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
      teacherId: user._id,
      totalMarks: questions.length * 10,
      passingMarks: passingMarks || (questions.length * 10 * 40) / 100,
      negativeMarkingPercent: normalizedNegativeMarking,
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

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Config from '@/lib/models/Config';

// Get all users
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'teacher'].includes(session.user.role)) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const users =
      session.user.role === 'teacher'
        ? await User.find({ role: 'student' }).select('-password')
        : await User.find().select('-password');

    return new Response(JSON.stringify({ users }), {
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

// Add new user (admin)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await dbConnect();

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password || !role) {
      return new Response(
        JSON.stringify({ message: 'Please provide all required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ message: 'Email already in use' }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    return new Response(
      JSON.stringify({
        message: 'User created successfully',
        user: user.toJSON(),
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

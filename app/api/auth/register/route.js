import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Config from '@/lib/models/Config';

export async function POST(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await dbConnect();

    const { name, email, password, confirmPassword } = await request.json();

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return new Response(
        JSON.stringify({ message: 'Please provide all required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (password !== confirmPassword) {
      return new Response(JSON.stringify({ message: 'Passwords do not match' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check public signup setting
    const config = await Config.findOne();
    if (config && !config.publicSignup) {
      return new Response(
        JSON.stringify({ message: 'Registration is currently disabled' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'Email already in use' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role: 'student',
    });

    await user.save();

    return new Response(
      JSON.stringify({
        message: 'User registered successfully',
        user: user.toJSON(),
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Registration failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

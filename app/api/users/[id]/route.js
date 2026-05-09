import { requireAuth } from '@/lib/api-auth';
import User from '@/lib/models/User';

// Update user
export async function PATCH(request, { params }) {
  try {
    const { user: adminUser, response } = await requireAuth(['admin']);

    if (response) {
      return response;
    }

    const { id } = await params;
    const { name, email, role, isActive } = await request.json();

    if (adminUser._id.toString() === id && isActive === false) {
      return new Response(JSON.stringify({ message: 'You cannot block your own admin account' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'User updated successfully', user }), {
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

// Delete user
export async function DELETE(request, { params }) {
  try {
    const { response } = await requireAuth(['admin']);

    if (response) {
      return response;
    }

    const { id } = await params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
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

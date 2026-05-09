import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db/mongodb';
import User from '@/lib/models/User';
import Config from '@/lib/models/Config';

export async function requireAuth(allowedRoles = []) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { session: null, user: null, response: unauthorizedResponse() };
  }

  await dbConnect();

  const user = await User.findById(session.user.id).select('role isActive name email');

  if (!user) {
    return { session: null, user: null, response: unauthorizedResponse() };
  }

  if (!user.isActive) {
    return { session, user, response: blockedResponse() };
  }

  const config = await Config.findOne().select('maintenanceMode');

  if (config?.maintenanceMode && user.role !== 'admin') {
    return { session, user, response: maintenanceResponse() };
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return { session, user, response: forbiddenResponse() };
  }

  return { session, user, response: null };
}

function unauthorizedResponse() {
  return new Response(JSON.stringify({ message: 'Unauthorized' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

function forbiddenResponse() {
  return new Response(JSON.stringify({ message: 'Forbidden' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

function blockedResponse() {
  return new Response(JSON.stringify({ message: 'Your account is blocked. Contact an administrator.' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}

function maintenanceResponse() {
  return new Response(JSON.stringify({ message: 'The LMS is currently in maintenance mode. Please try again later.' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

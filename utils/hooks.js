'use client';

export function useAuth() {
  const [session, setSession] = require('react').useState(null);
  const [loading, setLoading] = require('react').useState(true);

  require('react').useEffect(() => {
    const getSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();
  }, []);

  return { session, loading };
}

export function useRoleCheck(requiredRole) {
  const { session, loading } = useAuth();

  if (loading) return { isAuthorized: false, loading: true };
  if (!session) return { isAuthorized: false, loading: false };

  const isAuthorized = session.user?.role === requiredRole;
  return { isAuthorized, loading: false, user: session.user };
}

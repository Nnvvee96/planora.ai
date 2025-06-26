import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '@/features/admin/adminApi';
import { AdminDashboard } from '@/features/admin/adminApi';
import { useAuth } from '@/features/auth/authApi';

export function AdminPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        const { isAdmin, isEditor } = await adminService.checkAdminPrivileges(user.id);
        
        if (isAdmin || isEditor) {
          setIsAuthorized(true);
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking authorization:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthorization();
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <AdminDashboard />;
} 
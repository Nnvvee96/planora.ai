import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/authApi';
import { supabase } from '@/lib/supabase/client';
import { AdminDashboard } from '@/features/admin/adminApi';

const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdminOrEditor, setIsAdminOrEditor] = useState(false);
  const [isCheckingRoles, setIsCheckingRoles] = useState(true);

  useEffect(() => {
    const checkRoles = async () => {
      if (loading) return;

      if (!user) {
        navigate('/login');
        return;
      }

      // Use the is_user_in_role function for both roles
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_user_in_role', {
        p_user_id: user.id,
        p_role_name: 'admin',
      });

      const { data: isEditor, error: editorError } = await supabase.rpc('is_user_in_role', {
        p_user_id: user.id,
        p_role_name: 'editor',
      });

      if (adminError || editorError) {
        console.error('Error checking user roles:', adminError || editorError);
        navigate('/'); // Redirect to home on error
        return;
      }

      if (isAdmin || isEditor) {
        setIsAdminOrEditor(true);
      } else {
        navigate('/'); // Redirect if not admin or editor
      }
      
      setIsCheckingRoles(false);
    };

    checkRoles();
  }, [user, loading, navigate]);

  if (isCheckingRoles) {
    // You can return a loader here
    return <div>Loading...</div>;
  }

  return isAdminOrEditor ? <AdminDashboard /> : null;
};

export { AdminPage }; 
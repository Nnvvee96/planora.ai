import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { DbUserProfile } from '../../user-profile/types/profileTypes';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const UserManagementTable: React.FC = () => {
  const [users, setUsers] = useState<DbUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const allUsers = await adminService.getAllUsers();
        setUsers(allUsers);
        setError(null);
      } catch (err) {
        setError('Failed to fetch users.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleBetaToggle = async (userId: string, currentStatus: boolean) => {
    try {
      const updatedUser = await adminService.updateBetaTesterStatus(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? updatedUser : u));
    } catch (err) {
      setError('Failed to update beta status.');
      console.error(err);
    }
  };

  if (loading) return <div>Loading users...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Beta Tester</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_beta_tester}
                    onCheckedChange={(_newStatus) => handleBetaToggle(user.id, user.is_beta_tester)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserManagementTable } from './UserManagementTable';

const AdminDashboard: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <UserManagementTable />
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage application content.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View system health and analytics.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { AdminDashboard }; 
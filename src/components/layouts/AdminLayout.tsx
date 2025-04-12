import React from 'react';
import AdminNav from '@/components/AdminNav';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminNav />
      <main className="flex-1 overflow-x-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 
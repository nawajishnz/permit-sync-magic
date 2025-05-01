
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const AdminPortalSection: React.FC = () => {
  return (
    <motion.div 
      className="py-12 bg-gray-50 border-t border-gray-200 px-4"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Admin Portal</h2>
          <p className="text-gray-600 mb-6">
            If you're an administrator, access the admin dashboard to manage countries, visa applications, and more.
          </p>
          <Link to="/admin-login">
            <Button variant="default">
              Access Admin Portal
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminPortalSection;

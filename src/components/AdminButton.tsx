'use client';

import { useState } from 'react';
import { checkIsAdmin } from '../app/actions';
import AdminDialog from './AdminDialog';

export default function AdminButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleClick = async () => {
    const adminStatus = await checkIsAdmin();
    setIsAdmin(adminStatus);
    if (adminStatus) {
      setIsDialogOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
      >
        Admin
      </button>
      <AdminDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
} 
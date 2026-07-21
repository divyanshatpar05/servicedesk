'use client';
import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import DocketTable from './components/DocketTable';
import CreateDocketModal from './components/CreateDocketModal';

export default function ServiceDocketManagementPage() {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <AppLayout
      title="Service Docket Management"
      subtitle="Manage job cards across all service areas"
    >
      <DocketTable onCreateDocket={() => setCreateOpen(true)} />
      <CreateDocketModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppLayout>
  );
}
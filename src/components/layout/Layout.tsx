'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '@/contexts/SidebarContext';

interface LayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export default function Layout({ children, pageTitle }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="wrapper">
        <Sidebar />
        <div className="page-content">
          <Header pageTitle={pageTitle} />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}

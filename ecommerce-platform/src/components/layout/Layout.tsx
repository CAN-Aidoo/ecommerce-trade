import React from 'react';
import Header from './Header';
import Footer from './Footer';
import { cn } from '@/utils';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  hideFooter?: boolean;
  hideHeader?: boolean;
}

export default function Layout({ 
  children, 
  className, 
  hideFooter = false, 
  hideHeader = false 
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {!hideHeader && <Header />}
      
      <main className={cn('flex-1', className)}>
        {children}
      </main>
      
      {!hideFooter && <Footer />}
    </div>
  );
}
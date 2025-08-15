import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
  className?: string;
  separator?: React.ReactNode;
  showHome?: boolean;
}

export default function BreadcrumbNav({ 
  items, 
  className, 
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  showHome = true 
}: BreadcrumbNavProps) {
  const allItems = showHome ? [{ label: 'Home', href: '/' }, ...items] : items;

  return (
    <nav 
      className={cn('flex items-center space-x-2 text-sm', className)}
      aria-label="Breadcrumb"
    >
      {allItems.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && separator}
          
          {item.href ? (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {index === 0 && showHome ? (
                <div className="flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  <span>{item.label}</span>
                </div>
              ) : (
                item.label
              )}
            </Link>
          ) : (
            <span className="text-foreground font-medium">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
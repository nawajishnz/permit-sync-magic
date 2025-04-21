
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbsItemProps {
  to: string;
  children: React.ReactNode;
  active?: boolean;
}

export const BreadcrumbsItem = ({ to, children, active = false }: BreadcrumbsItemProps) => {
  return (
    <li className="inline-flex items-center">
      {active ? (
        <span className={cn("text-sm font-medium", active ? "text-gray-900" : "text-gray-500")}>
          {children}
        </span>
      ) : (
        <Link 
          to={to}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          {children}
        </Link>
      )}
    </li>
  );
};

interface BreadcrumbsProps {
  children: React.ReactNode;
  className?: string;
}

export const Breadcrumbs = ({ children, className }: BreadcrumbsProps) => {
  // Convert children to array to manipulate them
  const childrenArray = React.Children.toArray(children);
  
  return (
    <nav className={cn("mb-6", className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {React.Children.map(childrenArray, (child, index) => {
          return (
            <React.Fragment key={index}>
              {child}
              {index < childrenArray.length - 1 && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

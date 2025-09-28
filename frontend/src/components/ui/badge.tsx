import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <div
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      variant === 'default' && 'bg-slate-900 text-white',
      variant === 'outline' && 'border border-slate-200'
    )}
    {...props}
  />
);

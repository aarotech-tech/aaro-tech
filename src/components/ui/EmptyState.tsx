import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  secondaryActionOnClick?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  actionOnClick,
  secondaryActionLabel,
  secondaryActionHref,
  secondaryActionOnClick,
  children
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm">{description}</p>
      
      <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
        {actionLabel && actionHref && (
          <Button render={<Link href={actionHref} />}>
            {actionLabel}
          </Button>
        )}

        {actionLabel && actionOnClick && !actionHref && (
          <Button onClick={actionOnClick}>
            {actionLabel}
          </Button>
        )}

        {secondaryActionLabel && secondaryActionHref && (
          <Button variant="outline" render={<Link href={secondaryActionHref} />}>
            {secondaryActionLabel}
          </Button>
        )}

        {secondaryActionLabel && secondaryActionOnClick && !secondaryActionHref && (
          <Button variant="outline" onClick={secondaryActionOnClick}>
            {secondaryActionLabel}
          </Button>
        )}
      </div>

      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
}

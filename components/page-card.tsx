import type { ReactNode } from "react";

type PageCardProps = {
  children: ReactNode;
  className?: string;
};

export function PageCard({ children, className = "" }: PageCardProps) {
  return (
    <div className={`soft-panel p-6 sm:p-8 ${className}`.trim()}>{children}</div>
  );
}

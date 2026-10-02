import { Link } from "react-router-dom";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-surface/40 px-4 py-5">
      <p className="text-sm font-medium text-accent">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {actionLabel && actionHref && (
        <Link
          to={actionHref}
          className="mt-3 inline-flex items-center rounded-md bg-accent/10 px-3 py-1.5 text-sm font-medium text-accent hover:bg-accent/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

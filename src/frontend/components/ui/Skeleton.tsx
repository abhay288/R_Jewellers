import { cn } from "@/shared/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-luxury rounded-xl bg-secondary/60 relative overflow-hidden", className)}
      {...props}
    />
  );
}

export { Skeleton };

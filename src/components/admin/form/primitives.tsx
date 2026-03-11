import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { DialogContent as BaseDialogContent, DialogFooter as BaseDialogFooter, DialogHeader as BaseDialogHeader } from "@/components/ui/dialog";
import {
  TabsList as BaseTabsList,
  TabsTrigger as BaseTabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const AdminDialogContent = React.forwardRef<
  React.ElementRef<typeof BaseDialogContent>,
  React.ComponentPropsWithoutRef<typeof BaseDialogContent>
>(({ className, children, ...props }, ref) => (
  <BaseDialogContent
    ref={ref}
    className={cn("max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0", className)}
    {...props}
  >
    {children}
  </BaseDialogContent>
));
AdminDialogContent.displayName = "AdminDialogContent";

export const AdminDialogHeader = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialogHeader>) => (
  <BaseDialogHeader className={cn("px-8 pt-6 pb-4 border-b bg-muted/30", className)} {...props} />
);
AdminDialogHeader.displayName = "AdminDialogHeader";

export const AdminDialogFooter = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseDialogFooter>) => (
  <BaseDialogFooter className={cn("px-8 py-4 border-t bg-muted/30 flex-row justify-between gap-3", className)} {...props} />
);
AdminDialogFooter.displayName = "AdminDialogFooter";

export const AdminDialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 min-h-0 overflow-y-auto px-8 py-6", className)} {...props} />
);
AdminDialogBody.displayName = "AdminDialogBody";

type AdminTabsListProps = React.ComponentPropsWithoutRef<typeof BaseTabsList> & {
  columns?: number;
};

export const AdminTabsList = React.forwardRef<
  React.ElementRef<typeof BaseTabsList>,
  AdminTabsListProps
>(({ children, className, columns, style, ...props }, ref) => {
  const childCount = React.Children.toArray(children).filter(Boolean).length;
  const count = columns ?? (childCount || 1);
  return (
    <BaseTabsList
      ref={ref}
      className={cn(
        "mb-8 h-12 w-full rounded-none border border-border/60 bg-muted/50 p-0 text-muted-foreground flex overflow-x-auto md:grid md:overflow-visible",
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))`,
        ...style,
      }}
      {...props}
    >
      {children}
    </BaseTabsList>
  );
});
AdminTabsList.displayName = "AdminTabsList";

export const AdminTabsTrigger = React.forwardRef<
  React.ElementRef<typeof BaseTabsTrigger>,
  React.ComponentPropsWithoutRef<typeof BaseTabsTrigger>
>(({ className, ...props }, ref) => (
  <BaseTabsTrigger
    ref={ref}
    className={cn(
      "inline-flex h-full items-center justify-center whitespace-nowrap px-4 text-base font-semibold transition-colors rounded-none border-r border-border/60 flex-none basis-40 data-[state=active]:bg-background data-[state=active]:text-foreground first:border-l border-l-transparent data-[state=active]:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:flex-1",
      className,
    )}
    {...props}
  />
));
AdminTabsTrigger.displayName = "AdminTabsTrigger";

interface AdminFormSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

export const AdminFormSection = ({
  title,
  description,
  icon: Icon,
  actions,
  className,
  children,
  ...props
}: AdminFormSectionProps) => (
  <section className={cn("space-y-4", className)} {...props}>
    <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-2">
      <div className="flex items-center gap-2 text-foreground">
        {Icon ? <Icon className="h-5 w-5" /> : null}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
    {description ? (
      typeof description === "string" ? (
        <p className="text-sm text-muted-foreground">{description}</p>
      ) : (
        description
      )
    ) : null}
    {children}
  </section>
);
AdminFormSection.displayName = "AdminFormSection";

const columnsClassMap: Record<number, string> = {
  1: "",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

interface AdminFormFieldGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4;
}

export const AdminFormFieldGrid = ({
  columns = 2,
  className,
  ...props
}: AdminFormFieldGridProps) => (
  <div className={cn("grid grid-cols-1 gap-6", columnsClassMap[columns] ?? "", className)} {...props} />
);
AdminFormFieldGrid.displayName = "AdminFormFieldGrid";

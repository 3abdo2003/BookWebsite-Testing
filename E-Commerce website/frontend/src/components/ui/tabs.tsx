// src/components/ui/tabs.tsx
import * as React from "react";
import { cn } from "../../lib/utils";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const Tabs = ({ defaultValue, children, className }: TabsProps) => {
  const [selected, setSelected] = React.useState(defaultValue);

  const context = React.useMemo(
    () => ({
      selected,
      setSelected,
    }),
    [selected]
  );

  return (
    <div className={cn("w-full", className)}>
      <TabsContext.Provider value={context}>{children}</TabsContext.Provider>
    </div>
  );
};

const TabsContext = React.createContext<{
  selected: string;
  setSelected: (value: string) => void;
} | null>(null);

const TabsList = ({ children, className }: TabsListProps) => {
  return <div className={cn("flex", className)}>{children}</div>;
};

const TabsTrigger = ({ value, className, children }: TabsTriggerProps) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsTrigger must be used within Tabs");
  }

  const { selected, setSelected } = context;

  return (
    <button
      onClick={() => setSelected(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
        selected === value
          ? "border-primary text-primary"
          : "border-transparent text-muted hover:text-primary",
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, className, children }: TabsContentProps) => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error("TabsContent must be used within Tabs");
  }

  const { selected } = context;

  return selected === value ? (
    <div className={cn("mt-4", className)}>{children}</div>
  ) : null;
};

export { Tabs, TabsList, TabsTrigger, TabsContent };

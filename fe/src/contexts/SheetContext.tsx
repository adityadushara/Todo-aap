import { createContext, useContext, useState } from "react";

interface SheetContextType {
  isSheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextType>({ isSheetOpen: false, setSheetOpen: () => {} });

export function SheetProvider({ children }: { children: React.ReactNode }) {
  const [isSheetOpen, setSheetOpen] = useState(false);
  return (
    <SheetContext.Provider value={{ isSheetOpen, setSheetOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function useSheetContext() {
  return useContext(SheetContext);
}

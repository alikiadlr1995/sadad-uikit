import React, { PropsWithChildren, useEffect } from "react";

export type UIProviderProps = PropsWithChildren<{ fontFamily?: string }>;

export const UIProvider: React.FC<UIProviderProps> = ({ fontFamily, children }) => {
  useEffect(() => {
    if (fontFamily) document.documentElement.style.setProperty("--ui-font", fontFamily);
    return () => {
      if (fontFamily) document.documentElement.style.removeProperty("--ui-font");
    };
  }, [fontFamily]);

  return <>{children}</>;
};

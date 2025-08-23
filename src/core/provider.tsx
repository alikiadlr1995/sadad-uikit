// src/core/Provider.tsx
import * as React from "react";

export function SadadProvider({ fontFamily, children }: { fontFamily?: string | string[]; children: React.ReactNode }) {
  const cssFont = Array.isArray(fontFamily) ? fontFamily.join(", ") : fontFamily;
  const style = cssFont ? ({ ["--ui-font" as any]: cssFont } as React.CSSProperties) : undefined;
  return <div style={style}>{children}</div>;
}

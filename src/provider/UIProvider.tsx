// src/provider/UIProvider.tsx
import * as React from "react";
export type UIProviderProps = {
  fontFamily?: string | string[];   // مثل ["IRANSansX","Tahoma"]
  dir?: "rtl" | "ltr" | "auto";
  children: React.ReactNode;
};
const toFF = (ff?: string | string[]) =>
  !ff ? undefined : Array.isArray(ff) ? ff.map(n => /\s/.test(n)&&!/^["'].*["']$/.test(n) ? `"${n}"` : n).join(", ")
                                     : (/\s/.test(ff) && !/^["'].*["']$/.test(ff) ? `"${ff}"` : ff);
export function UIProvider({ fontFamily, dir="rtl", children }: UIProviderProps) {
  const style = fontFamily ? ({ ["--ui-font" as any]: toFF(fontFamily) } as React.CSSProperties) : undefined;
  return <div dir={dir} style={style}>{children}</div>;
}

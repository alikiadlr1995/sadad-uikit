// .storybook/preview.tsx
import "../src/styles/tw.css";       // Tailwind فقط برای Storybook (dev)
import "../src/styles/styles.css";   // استایل‌های کتابخانه (بدون base)

import type { Preview } from "@storybook/react";
import { UIProvider } from "../src/provider/UIProvider"; 
// ⬆️ در حال توسعه از سورس import کن. 
// وقتی پکیج publish شد، می‌تونی از "sadad-uikit" ایمپورت کنی.

export const decorators = [
  (Story) => (
    // <UIProvider fontFamily={["IRANSansX", "Tahoma"]}>
    <UIProvider >
      <Story />
    </UIProvider>
  ),
];

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
  },
};
export default preview;

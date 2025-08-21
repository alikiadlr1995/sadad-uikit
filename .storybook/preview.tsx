import type { Preview } from '@storybook/react';
import React from "react";
import { UIProvider } from "../src/provider/UIProvider";
import "../src/styles/styles.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <UIProvider fontFamily='"Vazirmatn", sans-serif'>
        <div style={{ padding: 24, background: "var(--ui-bg)", color: "var(--ui-text)" }}>
          <Story />
        </div>
      </UIProvider>
    ),
  ],
};

export default preview;

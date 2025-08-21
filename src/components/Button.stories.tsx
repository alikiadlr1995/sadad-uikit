import type { Meta, StoryObj } from '@storybook/react';

import { StorybookConfig } from '@storybook/react-vite';

import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Core/Button",
  component: Button,
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { children: "ارسال", variant: "primary" } };
export const Ghost: Story = { args: { children: "انصراف", variant: "ghost" } };

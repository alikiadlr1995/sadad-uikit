import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Playground: Story = {
  args: {
    children: "Action",
    variant: "primary",
    size: "md",
  },
};

export const WithIcons: Story = {
  args: {
    children: "Download",
    variant: "secondary",
    rightIcon: <span>⬇️</span>,
  },
};

export const Loading: Story = {
  args: {
    children: "Saving…",
    variant: "success",
    loading: true,
    fullWidth: false,
  },
};

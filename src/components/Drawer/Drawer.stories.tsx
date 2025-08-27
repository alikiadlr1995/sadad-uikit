import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Drawer } from "./Drawer";
import { Button } from "../Button"; // اگر ندارید، یک دکمه ساده جایگزین کنید

const meta: Meta<typeof Drawer> = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: { layout: "centered" },
};
export default meta;

type Story = StoryObj<typeof Drawer>;

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="font-ui">
        <Button onClick={() => setOpen(true)}>Open drawer</Button>
        <Drawer
          {...args}
          open={open}
          onOpenChange={setOpen}
          id="demo-drawer"
          title="Drawer title"
          description="Optional short description for context"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => setOpen(false)}>Confirm</Button>
            </div>
          }
        >
          <p className="text-sm text-gray-700">
            Put any content here. Forms, filters, details…
          </p>
        </Drawer>
      </div>
    );
  },
  args: {
    placement: "right",
    variant: "neutral",
    overlay: true,
    closeOnOverlayClick: true,
    escToClose: true,
    trapFocus: true,
    returnFocus: true,
    showClose: true,
  },
};

export const Left: Story = {
  ...Playground,
  args: { ...Playground.args, placement: "left" },
};
export const Top: Story = {
  ...Playground,
  args: { ...Playground.args, placement: "top", vars: { size: "20rem" } },
};
export const Bottom: Story = {
  ...Playground,
  args: { ...Playground.args, placement: "bottom", vars: { size: "20rem" } },
};
export const PrimaryThemed: Story = {
  ...Playground,
  args: {
    ...Playground.args,
    variant: "primary",
    vars: { size: "28rem", radius: 20, overlayBg: "rgba(37,99,235,.35)" },
  },
};

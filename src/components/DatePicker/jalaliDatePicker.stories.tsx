import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";
import { JalaliDatePicker } from "./jalaliDatePicker";
import '../../styles/tw.css'
import '../../styles/styles.css'

const meta: Meta<typeof JalaliDatePicker> = {
  title: "Core/DatePicker/JalaliDatePicker",
  component: JalaliDatePicker,
  argTypes: {
    mode: { control: "radio", options: ["single", "range"] },
    toPersianDigits: { control: "boolean" },
    clearable: { control: "boolean" },
    dir: { control: "radio", options: ["rtl", "ltr"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
  },
  args: {
    mode: "single",
    toPersianDigits: true,
    clearable: true,
    dir: "rtl",
    placeholder: "انتخاب تاریخ",
  },
};
export default meta;

type Story = StoryObj<typeof JalaliDatePicker>;

export const Playground: Story = {
  render: (args) => {
    const [val, setVal] = React.useState<any>(null);
    return (
      <div className="space-y-3">
        <JalaliDatePicker {...args} value={val} onChange={setVal} />
        <div className="text-xs text-gray-600">
          <div>Value (JS Date/Range):</div>
          <pre className="p-2 bg-gray-50 rounded">{JSON.stringify(val, null, 2)}</pre>
        </div>
      </div>
    );
  },
};

export const RangeMode: Story = { args: { mode: "range" } };

export const WithLimits: Story = {
  render: (args) => {
    const [val, setVal] = React.useState<any>(null);
    const min = new Date();
    const max = new Date(); max.setMonth(max.getMonth() + 2);
    return <JalaliDatePicker {...args} value={val} onChange={setVal} minDate={min} maxDate={max} />;
  },
};

export const DisabledDates: Story = {
  render: (args) => {
    const [val, setVal] = React.useState<any>(null);
    const isDateDisabled = (d: Date) => d.getDay() === 5; // جمعه‌ها غیرفعال
    return <JalaliDatePicker {...args} value={val} onChange={setVal} isDateDisabled={isDateDisabled} />;
  },
};

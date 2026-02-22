import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";

const meta = {
  title: "UI/Modal",
  component: Modal,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo({ size }: { size?: "sm" | "md" | "lg" | "xl" | "2xl" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Example Modal" size={size}>
        <p className="text-sm text-gray-700">
          This is the modal content. Press Escape or click the backdrop to close.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Confirm</Button>
        </div>
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: () => <ModalDemo />,
};

export const Small: Story = {
  render: () => <ModalDemo size="sm" />,
};

export const Large: Story = {
  render: () => <ModalDemo size="lg" />,
};

export const ExtraLarge: Story = {
  render: () => <ModalDemo size="xl" />,
};

export const TwoXL: Story = {
  name: "2XL (calendar width)",
  render: () => <ModalDemo size="2xl" />,
};

export const WithLongContent: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Long Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)} title="Long Content">
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} className="mb-2 text-sm text-gray-700">
              Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </p>
          ))}
          <div className="flex justify-end pt-2">
            <Button onClick={() => setOpen(false)}>Close</Button>
          </div>
        </Modal>
      </>
    );
  },
};

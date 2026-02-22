import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card, CardHeader, CardBody, CardFooter } from "./Card";
import { Button } from "./Button";

const meta = {
  title: "UI/Card",
  component: Card,
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BodyOnly: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardBody>
        <p className="text-sm text-gray-700">A simple card with just a body.</p>
      </CardBody>
    </Card>
  ),
};

export const WithHeader: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Card Title</h3>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-700">Card content goes here.</p>
      </CardBody>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardBody>
        <p className="text-sm text-gray-700">Card content with footer actions.</p>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary" size="sm">Cancel</Button>
        <Button size="sm">Save</Button>
      </CardFooter>
    </Card>
  ),
};

export const FullCard: Story = {
  render: () => (
    <Card className="max-w-sm">
      <CardHeader>
        <h3 className="font-semibold text-gray-900">Chicken Stir Fry</h3>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-500">Quick Asian-style stir fry with vegetables.</p>
      </CardBody>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="ghost" size="sm">View</Button>
        <Button variant="secondary" size="sm">Edit</Button>
        <Button variant="danger" size="sm">Delete</Button>
      </CardFooter>
    </Card>
  ),
};

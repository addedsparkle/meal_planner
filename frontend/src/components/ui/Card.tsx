import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={["rounded-lg border border-gray-200 bg-white shadow-sm", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className = "", children, ...props }: CardHeaderProps) {
  return (
    <div
      className={["border-b border-gray-200 px-5 py-4", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {}

export function CardBody({ className = "", children, ...props }: CardBodyProps) {
  return (
    <div className={["px-5 py-4", className].join(" ")} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export function CardFooter({ className = "", children, ...props }: CardFooterProps) {
  return (
    <div
      className={["border-t border-gray-200 px-5 py-3", className].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

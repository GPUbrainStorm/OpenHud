import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Container = ({
  children,
  className = "",
  ...rest
}: ContainerProps) => {
  return (
    <div
      className={`container flex h-full min-h-0 flex-col overflow-hidden ${className}`.trim()}
      {...rest}
    >
      {children}
    </div>
  );
};

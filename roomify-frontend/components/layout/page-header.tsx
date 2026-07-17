import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  breadcrumb?: ReactNode;
};

export function PageHeader({
  title,
  description,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="mb-4">
      <div>
        <h2 className="text-[1.85rem] font-bold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-[2.1rem]">
          {title}
        </h2>
        <p className="max-w-1xl text-[15px] text-[color:var(--color-text-secondary)] sm:text-base sm:leading-7">
          {description}
        </p>
      </div>
      {breadcrumb ? (
        <div className="mt-2 text-sm text-[color:var(--color-text-secondary)] sm:mt-2.5">
          {breadcrumb}
        </div>
      ) : null}
    </div>
  );
}

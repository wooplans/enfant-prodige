"use client";

import { usePathname } from "next/navigation";

export default function ConditionalNav({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isProductPage = /^\/bd\/[^/]+/.test(pathname);

  if (isProductPage) {
    return <>{children}</>;
  }

  return (
    <>
      {header}
      <main className="flex-1">{children}</main>
      {footer}
    </>
  );
}

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/brand-logo";

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-72 w-96 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-10 text-center">
          <Link to="/" className="inline-block transition-opacity hover:opacity-90">
            <BrandLogo size="md" />
          </Link>
          <h1 className="mt-6 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
        <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>
      </div>
    </div>
  );
}

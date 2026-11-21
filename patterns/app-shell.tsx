"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// icon is a rendered element (for example <Users aria-hidden />) so server pages can pass it in.
export type NavItem = { href: string; label: string; icon: ReactNode };

function NavLinks({ items, current }: { items: NavItem[]; current: string }) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map(({ href, label, icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={href === current ? "page" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4 [&_svg]:shrink-0",
            "current:bg-muted current:text-foreground"
          )}
        >
          {icon}
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand({ name }: { name: string }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary text-sm font-semibold text-primary-foreground">
        {name.slice(0, 1).toUpperCase()}
      </span>
      <span className="truncate font-heading font-semibold">{name}</span>
    </div>
  );
}

// Signed-in layout: side navigation on wide screens, a top bar with a menu on phones and tablets.
export function AppShell({
  merchantName, items, current, children
}: { merchantName: string; items: NavItem[]; current: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh xl:grid xl:grid-cols-5">
      <aside className="hidden border-r bg-card p-4 xl:col-span-1 xl:flex xl:flex-col xl:gap-6">
        <Brand name={merchantName} />
        <NavLinks items={items} current={current} />
      </aside>
      <div className="flex min-w-0 flex-col xl:col-span-4">
        <div className="flex items-center justify-between gap-3 border-b bg-card px-4 py-2 xl:hidden">
          <Brand name={merchantName} />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle>{merchantName}</SheetTitle>
              <SheetDescription className="sr-only">Main menu</SheetDescription>
              <NavLinks items={items} current={current} />
            </SheetContent>
          </Sheet>
        </div>
        <main className="mx-auto flex w-full max-w-content flex-col gap-6 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

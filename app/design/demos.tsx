"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>The customer gets an email. You can rebook any time.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Keep booking</Button></DialogClose>
          <DialogClose asChild><Button variant="destructive">Cancel booking</Button></DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function MenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Booking</DropdownMenuLabel>
        <DropdownMenuItem>Reschedule</DropdownMenuItem>
        <DropdownMenuItem>Send reminder</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Cancel booking</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

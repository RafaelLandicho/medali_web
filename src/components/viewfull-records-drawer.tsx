"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import type { Patient } from "./medical_records";
import { ViewFullPatient } from "./view-full-records";

type FullRecordsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function FullRecordsDrawer({
  open,
  onOpenChange,
  patient: patient,
}: FullRecordsDrawerProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="!max-h-[85vh] !overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Full Patient Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-0">
            <ViewFullPatient
              open={open}
              onOpenChange={onOpenChange}
              patient={patient}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] !w-[90vw]">
        <DialogHeader>
          <DialogTitle>Full Patient Details</DialogTitle>
        </DialogHeader>
        <ViewFullPatient
          open={open}
          onOpenChange={onOpenChange}
          patient={patient}
        />
      </DialogContent>
    </Dialog>
  );
}

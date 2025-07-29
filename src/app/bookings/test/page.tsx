"use client"

import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { Button } from "@/components/ui/button";
import { BookingDetailsDialog } from "@/components/bookings/BookingDetailsDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TestPage() {
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isSimpleDialogOpen, setIsSimpleDialogOpen] = useState(false);

  // Sample booking data
  const sampleBooking = {
    id: "test-booking-1",
    teacherName: "John Smith",
    teacherEmail: "john.smith@example.com",
    date: new Date().toISOString(),
    time: "1",
    notes: "This is a test booking note",
    room: "Room 101",
    commons: "North",
    subject: "Mathematics",
    subjectCode: "MATH101",
    createdAt: new Date().toISOString()
  };

  const sampleSlot = {
    number: 1,
    startTime: "09:00",
    endTime: "10:30"
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 z-0">
      <Header />
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-6">Dialog Component Test Page</h1>

        <div className="space-y-6">
          <div className="p-4 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Test 1: BookingDetailsDialog</h2>
            <Button onClick={() => setIsBookingDialogOpen(true)}>
              Open Booking Dialog
            </Button>
          </div>

          <div className="p-4 bg-white rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Test 2: Simple Dialog</h2>
            <Button onClick={() => setIsSimpleDialogOpen(true)}>
              Open Simple Dialog
            </Button>
          </div>
        </div>
      </div>

      {/* Test 1: BookingDetailsDialog component */}
      <BookingDetailsDialog
        booking={sampleBooking}
        slot={sampleSlot}
        isOpen={isBookingDialogOpen}
        onClose={() => setIsBookingDialogOpen(false)}
      />

      {/* Test 2: Simple basic dialog */}
      <Dialog open={isSimpleDialogOpen} onOpenChange={setIsSimpleDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background">
          <DialogHeader>
            <DialogTitle>Simple Test Dialog</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>This is a simple test dialog with explicit background class.</p>
            <p className="mt-2 text-gray-500">If you see a white background, this dialog is working correctly.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
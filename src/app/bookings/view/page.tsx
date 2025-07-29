"use client"

import {useState} from "react";
import {Header} from "@/components/dashboard/Header"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {formatTime} from "@/lib/utils"
import {format} from "date-fns"
import {ChevronLeft, ChevronRight, Eye, Loader2, Plus, Search} from "lucide-react"
import Link from "next/link"
import {useBookingsView} from "@/hooks/useBookingsView"
import {calculateTermAndWeek} from "@/lib/dateUtils"
import {BookingDetailsDialog} from "@/components/bookings/BookingDetailsDialog"

export default function ViewBookingPage() {
  const {
    loading,
    paginatedData,
    search,
    setSearch,
    totalPages,
    currentPage,
    goToPreviousPage,
    goToNextPage,
    slotsMap,
    totalBookings,
  } = useBookingsView();

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handleViewBooking = (booking) => {
    const weekday = new Date(booking.date).toLocaleDateString("en-US", {weekday: "long"});
    const slotsForDay = slotsMap[weekday] || [];
    const slotDef = slotsForDay.find(s => s.number === Number.parseInt(booking.time, 10));

    setSelectedBooking(booking);
    setSelectedSlot(slotDef);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 z-0">
      <Header/>
      <div className="p-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Bookings</h1>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"/>
                <Input
                  placeholder="Search by teacher, room, subject, or time."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button className="whitespace-nowrap" asChild>
              <Link href="/bookings/new">
                <Plus className="h-4 w-4 mr-2"/>
                New Booking
              </Link>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500"/>
          </div>
        ) : (
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Room & Kainga</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map(booking => {
                    const weekday = new Date(booking.date).toLocaleDateString("en-US", {weekday: "long"});
                    const slotsForDay = slotsMap[weekday] || [];
                    const slotDef = slotsForDay.find(s => s.number === Number.parseInt(booking.time, 10));
                    return (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.teacherName}</div>
                            <div className="text-sm text-gray-500">{booking.teacherEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.subject}</div>
                            <div className="text-sm text-gray-500">{booking.subjectCode}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{booking.room}</div>
                            <div className="text-sm text-gray-500">{booking.commons}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            {format(new Date(booking.date), "MMM dd, yyyy")}
                            <div className="text-sm text-gray-500">
                              {slotDef
                                ? `Slot ${slotDef.number} (${formatTime(slotDef.startTime)}–${formatTime(slotDef.endTime)})`
                                : `Slot ${booking.time}`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {booking.createdAt ? (
                            <div>
                              <div className="font-medium">
                                {format(new Date(booking.createdAt), "EEEE")}
                                {(() => {
                                  const date = new Date(booking.createdAt);
                                  const {term, weekInTerm} = calculateTermAndWeek(date);
                                  return ` (Week ${weekInTerm}, Term ${term})`;
                                })()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(booking.createdAt), "dd MMM, yyyy h:mm a")}
                              </div>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewBooking(booking)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1.5"/>View
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {totalBookings > 0 && (
              <div className="flex items-center justify-end space-x-2 px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4"/>
                </Button>
                <Button variant="outline" size="sm" onClick={goToNextPage} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4"/>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <BookingDetailsDialog
        booking={selectedBooking}
        slot={selectedSlot}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
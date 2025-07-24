"use client"

import {Header} from "@/components/dashboard/Header"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import * as Sentry from "@sentry/nextjs";
import {format} from "date-fns"
import {ChevronLeft, ChevronRight, Eye, Loader2, Pencil, Plus, Search} from "lucide-react"
import {useEffect, useState} from "react"
import Link from "next/link";

interface Booking {
  id: string
  teacherName: string
  teacherEmail: string
  date: string
  time: string
  notes?: string
  room?: string
  commons?: string
  subject?: string
  subjectCode?: string
}

export default function ViewBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const pageSize = 10

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true)
      try {
        const res = await fetch("/api/bookings/view")
        if (!res.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const data = await res.json()

        const bookingsData: Booking[] = (data || []).map((b: Booking) => ({
          id: b.id,
          teacherName: b.teacherName,
          teacherEmail: b.teacherEmail,
          date: b.date,
          time: b.time,
          notes: b.notes,
          room: b.room ?? "",
          commons: b.commons ?? "",
          subject: b.subject ?? "",
          subjectCode: b.subjectCode ?? ""
        }))

        setBookings(bookingsData)
        setFilteredBookings(bookingsData)
      } catch (error) {
        Sentry.captureException(error)
        console.error("Failed to fetch bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  useEffect(() => {
    let result = bookings

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        booking =>
          booking.teacherName.toLowerCase().includes(searchLower) ||
          booking.teacherEmail.toLowerCase().includes(searchLower) ||
          (booking.room ?? "").toLowerCase().includes(searchLower) ||
          (booking.commons ?? "").toLowerCase().includes(searchLower) ||
          (booking.subject ?? "").toLowerCase().includes(searchLower) ||
          (booking.subjectCode ?? "").toLowerCase().includes(searchLower)
      )
    }

    setFilteredBookings(result)
    setCurrentPage(1)
  }, [search, bookings])

  const paginatedData = filteredBookings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const totalPages = Math.ceil(filteredBookings.length / pageSize)

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select
                value={statusFilter || undefined}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filter by status"/>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((booking) => (
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
                          <div className="text-sm text-gray-500">{booking.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-3.5 w-3.5 mr-1.5"/>
                            View
                          </Button>
                          <Button size="sm" variant="default">
                            <Pencil className="h-3.5 w-3.5 mr-1.5"/>
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No bookings found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {filteredBookings.length > 0 && (
              <div className="flex items-center justify-end space-x-2 px-4 py-4 border-t">
                <div className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4"/>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4"/>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
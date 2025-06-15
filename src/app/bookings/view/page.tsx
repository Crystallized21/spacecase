"use client"

import {Header} from "@/components/dashboard/Header"
import {Badge} from "@/components/ui/badge"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import * as Sentry from "@sentry/nextjs";
import {format} from "date-fns"
import {ChevronLeft, ChevronRight, Eye, Loader2, Pencil, Plus, Search} from "lucide-react"
import {useEffect, useState} from "react"

interface Booking {
  id: string
  teacherName: string
  teacherEmail: string
  date: string
  time: string
  status: "confirmed" | "pending" | "cancelled"
  roomType: string
  notes?: string
}

export default function ViewBookingPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const pageSize = 10

  // mock data fetching 
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        // mock data
        const mockData: Booking[] = [
          {
            id: "1",
            teacherName: "John Doe",
            teacherEmail: "john@example.com",
            date: "2023-06-15",
            time: "14:00",
            status: "confirmed",
            roomType: "Kea Pod"
          },
          {
            id: "2",
            teacherName: "Jane Smith",
            teacherEmail: "jane@example.com",
            date: "2023-06-16",
            time: "10:30",
            status: "pending",
            roomType: "Waka Commons"
          },
          // maybe add more mock data here
        ]

        setBookings(mockData)
        setFilteredBookings(mockData)
      } catch (error) {
        Sentry.captureException(error);
        console.error("Failed to fetch bookings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  // Handle search and filtering
  useEffect(() => {
    let result = bookings

    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(
        booking =>
          booking.teacherName.toLowerCase().includes(searchLower) ||
          booking.teacherEmail.toLowerCase().includes(searchLower) ||
          booking.roomType.toLowerCase().includes(searchLower)
      )
    }

    if (statusFilter) {
      result = result.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(result)
    setCurrentPage(1)
  }, [search, statusFilter, bookings])

  // Pagination logic
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

  // Status badge variant mapping
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
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
                  placeholder="Search by teacher, room, or time."
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
            <Button className="whitespace-nowrap">
              <Plus className="h-4 w-4 mr-2"/>
              New Booking
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
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Room & Kainga</TableHead>
                  <TableHead>Status</TableHead>
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
                          {format(new Date(booking.date), "MMM dd, yyyy")}
                          <div className="text-sm text-gray-500">{booking.time}</div>
                        </div>
                      </TableCell>
                      <TableCell>{booking.roomType}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status.toUpperCase()}
                        </Badge>
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

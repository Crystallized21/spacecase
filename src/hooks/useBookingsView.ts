import {useEffect, useState} from "react";
import * as Sentry from "@sentry/nextjs";

// Define types for our data
interface Booking {
  id: string;
  teacherName: string;
  teacherEmail: string;
  date: string;
  time: string;
  notes?: string;
  room?: string;
  commons?: string;
  subject?: string;
  subjectCode?: string;
}

interface Slot {
  id: number;
  number: number;
  day: string;
  startTime: string;
  endTime: string;
}

const PAGE_SIZE = 10;

export function useBookingsView() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [slotsMap, setSlotsMap] = useState<Record<string, Slot[]>>({});

  // fetch all bookings on initial load
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/bookings");
        if (!res.ok) throw new Error("Failed to fetch bookings");
        const data = await res.json();
        setBookings(data);
        setFilteredBookings(data);
      } catch (err) {
        Sentry.captureException(err);
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // apply filters when search term or source data changes
  useEffect(() => {
    let result = bookings;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        [b.teacherName, b.teacherEmail, b.room, b.commons, b.subject, b.subjectCode]
          .some(field => field?.toLowerCase().includes(q))
      );
    }
    setFilteredBookings(result);
    setCurrentPage(1);
  }, [search, bookings]);

  // Fetch slots for the visible days
  useEffect(() => {
    const days = Array.from(new Set(bookings.map(b => new Date(b.date).toLocaleDateString("en-US", {weekday: "long"}))));
    for (const day of days) {
      if (!slotsMap[day]) {
        fetch(`/api/bookings/slots?day=${encodeURIComponent(day)}`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setSlotsMap(prev => ({...prev, [day]: data}));
            }
          })
          .catch(err => Sentry.captureException(err));
      }
    }
  }, [bookings, slotsMap]);

  // pagination logic
  const paginatedData = filteredBookings.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const totalPages = Math.ceil(filteredBookings.length / PAGE_SIZE);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);

  return {
    loading,
    paginatedData,
    search,
    setSearch,
    totalPages,
    currentPage,
    goToPreviousPage,
    goToNextPage,
    slotsMap,
    totalBookings: filteredBookings.length,
  };
}
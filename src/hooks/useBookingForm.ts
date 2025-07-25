import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import * as Sentry from "@sentry/nextjs";

interface Subject {
  id: string;
  name: string;
  code?: string;
  line: string
}

interface Slot {
  id: number;
  number: number;
  day: string;
  startTime: string;
  endTime: string;
}

export function useBookingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    common: "",
    room: "",
    date: undefined as Date | undefined,
    slot: "",
    justification: ""
  });

  const [commons, setCommons] = useState<string[]>([]);
  const [rooms, setRooms] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Fetch commons
  useEffect(() => {
    setLoading(true);
    fetch("/api/bookings/commons")
      .then(res => res.json())
      .then(data => setCommons(data))
      .catch(() => setCommons([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch subjects
  useEffect(() => {
    setLoading(true);
    fetch("/api/bookings/subjects")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch rooms when a common is selected
  useEffect(() => {
    if (!formData.common) {
      setRooms([]);
      setFormData(prev => ({...prev, room: ""}));
      return;
    }
    setLoading(true);
    fetch(`/api/bookings/rooms?common=${encodeURIComponent(formData.common)}`)
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [formData.common]);

  // Fetch slots when a date is selected
  useEffect(() => {
    if (!formData.date) {
      setSlots([]);
      setFormData(prev => ({...prev, slot: ""}));
      return;
    }
    const dayName = formData.date.toLocaleDateString('en-US', {weekday: 'long'});
    setLoading(true);
    fetch(`/api/bookings/slots?day=${encodeURIComponent(dayName)}`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setSlots(data) : setSlots([]))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [formData.date]);

  const handleChange = (key: string, value: string | Date | undefined) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking');
      }

      alert('Booking created successfully!');
      router.push('/bookings/view');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('Failed to create booking. Please try again.');
      Sentry.captureException(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    loading,
    isSubmitting,
    formData,
    commons,
    rooms,
    subjects,
    slots,
    handleChange,
    handleSubmit,
  };
}
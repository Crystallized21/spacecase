import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {toast} from "sonner";

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

  // Separate loading states
  const [loadingCommons, setLoadingCommons] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    setLoadingCommons(true);
    fetch("/api/bookings/commons")
      .then(res => res.json())
      .then(data => setCommons(data))
      .catch(() => setCommons([]))
      .finally(() => setLoadingCommons(false));
  }, []);

  // Fetch subjects
  useEffect(() => {
    setLoadingSubjects(true);
    fetch("/api/bookings/subjects")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, []);

  // Fetch rooms when a common is selected
  useEffect(() => {
    if (!formData.common) {
      setRooms([]);
      setFormData(prev => ({...prev, room: ""}));
      return;
    }
    setLoadingRooms(true);
    fetch(`/api/bookings/rooms?common=${encodeURIComponent(formData.common)}`)
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [formData.common]);

  // Fetch slots when a date is selected
  useEffect(() => {
    if (!formData.date) {
      setSlots([]);
      setFormData(prev => ({...prev, slot: ""}));
      return;
    }
    const dayName = formData.date.toLocaleDateString('en-US', {weekday: 'long'});
    setLoadingSlots(true);
    fetch(`/api/bookings/slots?day=${encodeURIComponent(dayName)}`)
      .then(res => res.json())
      .then(data => Array.isArray(data) ? setSlots(data) : setSlots([]))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [formData.date]);

  const handleChange = (key: string, value: string | Date | undefined) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSubmit = async (opts?: { onSuccess?: () => void }) => {
    // Create a toast promise that will show loading/success/error states
    return toast.promise(
      (async () => {
        setIsSubmitting(true);
        try {
          // Split subject value to get UUID and line
          let subjectId = formData.subject;
          let line = "";
          if (formData.subject.includes("-")) {
            const parts = formData.subject.split("-");
            subjectId = parts.slice(0, 5).join("-");
            line = parts.slice(5).join("-");
          }

          const payload = {
            ...formData,
            subject: subjectId,
            line,
          };

          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'Failed to create booking');
          }

          if (opts?.onSuccess) {
            opts.onSuccess();
          }

          await new Promise(resolve => setTimeout(resolve, 1500));
          router.push('/bookings/view');
          return result; // Return result for the success message
        } catch (error) {
          console.error('Error submitting booking:', error);
          Sentry.captureException(error);
          throw error; // Rethrow to trigger the error toast
        } finally {
          setIsSubmitting(false);
        }
      })(),
      {
        loading: 'Creating your booking...',
        success: (data) => 'Booking created successfully!',
        error: (error) => `Error: ${error.message || 'Failed to create booking'}`,
      }
    );
  };

  return {
    loadingCommons,
    loadingSubjects,
    loadingRooms,
    loadingSlots,
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
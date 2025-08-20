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
  isBooked?: boolean;
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

  const [slotRefreshTrigger, setSlotRefreshTrigger] = useState(0);

  // fetch subjects
  useEffect(() => {
    setLoadingSubjects(true);
    fetch("/api/bookings/subjects")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, []);

  // fetch commons
  useEffect(() => {
    // reset commons when subject changes
    setCommons([]);
    setFormData(prev => ({...prev, common: "", room: ""}));

    // don't fetch if no subject is selected
    if (!formData.subject) {
      setLoadingCommons(false);
      return;
    }

    // extract the subject ID from the formData.subject string
    let subjectId = formData.subject;
    if (formData.subject.includes("-")) {
      const parts = formData.subject.split("-");
      subjectId = parts.slice(0, 5).join("-");
    }

    setLoadingCommons(true);

    fetch(`/api/bookings/commons?subject=${encodeURIComponent(subjectId)}`)
      .then(res => res.json())
      .then(data => setCommons(Array.isArray(data) ? data : []))
      .catch(() => setCommons([]))
      .finally(() => setLoadingCommons(false));
  }, [formData.subject]);

  // fetch rooms when a common is selected
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

  // fetch slots when a date is selected
  useEffect(() => {
    // Reset slots when date, room or subject changes
    setSlots([]);
    setFormData(prev => ({...prev, slot: ""}));

    if (!formData.date) {
      setLoadingSlots(false);
      return;
    }

    const dayName = formData.date.toLocaleDateString('en-US', {weekday: 'long'});
    const dateStr = formData.date.toISOString().split('T')[0];
    setLoadingSlots(true);

    // Build URL with all required parameters
    let url = `/api/bookings/slots?day=${encodeURIComponent(dayName)}`;

    // Add subject ID and line number if available
    if (formData.subject) {
      // The subject format is "subject_id-line_number"
      // Need to find the last hyphen to separate them correctly
      const lastHyphenIndex = formData.subject.lastIndexOf('-');

      if (lastHyphenIndex !== -1) {
        const subjectId = formData.subject.substring(0, lastHyphenIndex);
        const line = formData.subject.substring(lastHyphenIndex + 1);

        url += `&subject=${encodeURIComponent(subjectId)}`;
        url += `&line=${encodeURIComponent(line)}`;
      } else {
        // Fallback in case there's no hyphen
        url += `&subject=${encodeURIComponent(formData.subject)}`;
      }
    }

    // Add room and date if available
    if (formData.room) {
      url += `&room=${encodeURIComponent(formData.room)}&date=${encodeURIComponent(dateStr)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          console.log("Loaded slots with availability:", data);
          setSlots(data);
        } else {
          setSlots([]);
        }
      })
      .catch(error => {
        console.error("Error fetching slots:", error);
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [formData.date, formData.room, formData.subject]);

  useEffect(() => {
    if (formData.room && formData.date) {
      const dayName = formData.date.toLocaleDateString('en-US', {weekday: 'long'});
      const dateStr = formData.date.toISOString().split('T')[0];

      fetch(`/api/bookings/slots?day=${encodeURIComponent(dayName)}&room=${encodeURIComponent(formData.room)}&date=${encodeURIComponent(dateStr)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Ensure slot numbers are treated as strings when checking booked status
            const formattedData = data.map(slot => ({
              ...slot,
              number: slot.number,
              isBooked: !!slot.isBooked // Ensure this is a boolean
            }));
            console.log("Processed slot data:", formattedData);
            setSlots(formattedData);
          }
        })
        .catch(error => console.error("Failed to refresh slot availability:", error));
    }
  }, [formData.room, formData.date]);

  // Add effect to clear slot selection if the selected slot becomes unavailable
  useEffect(() => {
    // If a slot is selected and it's now marked as booked, clear the selection
    if (formData.slot && slots.some(s =>
      s.number.toString() === formData.slot && s.isBooked
    )) {
      setFormData(prev => ({...prev, slot: ""}));
    }
  }, [slots, formData.slot]);

  const handleChange = (key: string, value: string | Date | undefined) => {
    setFormData(prev => ({...prev, [key]: value}));
  };

  const handleSubmit = async (opts?: { onSuccess?: () => void }) => {
    // create a toast promise that will show loading/success/error states
    return toast.promise(
      (async () => {
        setIsSubmitting(true);
        try {
          // split subject value to get UUID and line
          let subjectId = formData.subject;
          let line = "";

          const lastHyphenIndex = formData.subject.lastIndexOf('-');
          if (lastHyphenIndex !== -1) {
            subjectId = formData.subject.substring(0, lastHyphenIndex);
            line = formData.subject.substring(lastHyphenIndex + 1);
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
            if (response.status === 409) { // Conflict status
              throw new Error('This room is already booked for the selected time slot');
            }
            throw new Error(result.error || 'Failed to create booking');
          }

          setSlotRefreshTrigger(prev => prev + 1); // Trigger slot refresh

          if (opts?.onSuccess) {
            opts.onSuccess();
          }

          router.push('/bookings/view');
          return result; // Return result for the success message
        } catch (error) {
          console.error('Error submitting booking:', error);
          Sentry.captureException(error);

          // rethrow to trigger the error toast
          throw error;
        } finally {
          setIsSubmitting(false);
        }
      })(),
      {
        loading: 'Creating your booking...',
        success: () => 'Booking created successfully!',
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
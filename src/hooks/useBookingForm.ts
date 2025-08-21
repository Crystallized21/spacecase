import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import * as Sentry from "@sentry/nextjs";
import {toast} from "sonner";
import {format} from "date-fns";

interface Subject {
  id: string;
  name: string;
  code?: string;
  line: string;
}

interface Slot {
  id: number;
  number: number;
  day: string;
  startTime: string;
  endTime: string;
  isBooked?: boolean;
}

interface RoomWithBookingStatus {
  name: string;
  isBooked: boolean;
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
  const [rooms, setRooms] = useState<RoomWithBookingStatus[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  const [slotRefreshTrigger, setSlotRefreshTrigger] = useState(0);

  // subjects
  useEffect(() => {
    setLoadingSubjects(true);
    fetch("/api/bookings/subjects")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(() => setSubjects([]))
      .finally(() => setLoadingSubjects(false));
  }, []);

  // commons
  useEffect(() => {
    // reset commons when subject changes
    setCommons([]);
    setFormData(prev => ({...prev, common: "", room: "", slot: ""}));

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

  // Initial slots loading for selected date and subject
  // biome-ignore lint/correctness/useExhaustiveDependencies: only refresh slots when date/subject change
  useEffect(() => {
    // Reset slots when date or subject changes
    setSlots([]);
    setFormData(prev => ({...prev, slot: "", room: ""}));

    if (!formData.date) {
      setLoadingSlots(false);
      return;
    }

    const dayName = formData.date.toLocaleDateString("en-US", {weekday: "long"});
    const dateStr = format(formData.date, "yyyy-MM-dd");
    setLoadingSlots(true);

    // Always include date so API can mark booked slots correctly
    let url = `/api/bookings/slots?day=${encodeURIComponent(dayName)}&date=${encodeURIComponent(dateStr)}`;

    // Add subject ID and line number if available
    if (formData.subject) {
      const lastHyphenIndex = formData.subject.lastIndexOf("-");
      if (lastHyphenIndex !== -1) {
        const subjectId = formData.subject.substring(0, lastHyphenIndex);
        const line = formData.subject.substring(lastHyphenIndex + 1);

        url += `&subject=${encodeURIComponent(subjectId)}`;
        url += `&line=${encodeURIComponent(line)}`;
      } else {
        // fallback in case there's no hyphen
        url += `&subject=${encodeURIComponent(formData.subject)}`;
      }
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSlots(data);
        else setSlots([]);
      })
      .catch(error => {
        console.error("Error fetching slots:", error);
        setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [formData.date, formData.subject, slotRefreshTrigger]);

  // Separate effect to update slot booking status when room changes
  useEffect(() => {
    if (formData.room && formData.date && slots.length > 0) {
      const dayName = formData.date.toLocaleDateString("en-US", {weekday: "long"});
      const dateStr = format(formData.date, "yyyy-MM-dd");

      // Only fetch booking status updates, don't reset selections
      let url = `/api/bookings/slots?day=${encodeURIComponent(dayName)}&date=${encodeURIComponent(dateStr)}&room=${encodeURIComponent(formData.room)}`;

      // Add subject info if available
      if (formData.subject) {
        const lastHyphenIndex = formData.subject.lastIndexOf("-");
        if (lastHyphenIndex !== -1) {
          const subjectId = formData.subject.substring(0, lastHyphenIndex);
          const line = formData.subject.substring(lastHyphenIndex + 1);
          url += `&subject=${encodeURIComponent(subjectId)}`;
          url += `&line=${encodeURIComponent(line)}`;
        } else {
          url += `&subject=${encodeURIComponent(formData.subject)}`;
        }
      }

      console.log("Fetching slot booking status with URL:", url);

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            console.log("Received updated slot data:", data);

            // Update slots with booking information
            setSlots(prev => {
              const updatedSlots = prev.map(slot => {
                const updatedSlot = data.find(s => s.number === slot.number);
                if (updatedSlot?.isBooked) {
                  console.log(`Marking slot ${slot.number} as booked`);
                  return {...slot, isBooked: true};
                }
                return slot;
              });
              console.log("Updated slots:", updatedSlots);
              return updatedSlots;
            });
          }
        })
        .catch(error => {
          console.error("Error updating slot booking status:", error);
        });
    }
  }, [formData.room, formData.date, slots.length, formData.subject]);

  // rooms with availability for selected slot
  useEffect(() => {
    // Reset room selection when slot changes
    setFormData(prev => ({...prev, room: ""}));

    if (!formData.common || !formData.date || !formData.slot) {
      setRooms([]);
      return;
    }

    setLoadingRooms(true);

    const dateStr = format(formData.date, "yyyy-MM-dd");

    // Get rooms with availability information for the selected time slot
    fetch(`/api/bookings/rooms?common=${encodeURIComponent(formData.common)}&date=${encodeURIComponent(dateStr)}&slot=${encodeURIComponent(formData.slot)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRooms(data);
        else setRooms([]);
      })
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [formData.common, formData.date, formData.slot]);

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

          const lastHyphenIndex = formData.subject.lastIndexOf("-");
          if (lastHyphenIndex !== -1) {
            subjectId = formData.subject.substring(0, lastHyphenIndex);
            line = formData.subject.substring(lastHyphenIndex + 1);
          }

          const payload = {
            subject: subjectId,
            line,
            common: formData.common,
            room: formData.room,
            date: formData.date ? format(formData.date, "yyyy-MM-dd") : undefined,
            slot: formData.slot,
            justification: formData.justification,
          } as const;

          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (!response.ok) {
            if (response.status === 409) {
              throw new Error("This room is already booked for the selected time slot");
            }
            throw new Error(result.error || "Failed to create booking");
          }

          setSlotRefreshTrigger(prev => prev + 1);

          if (opts?.onSuccess) opts.onSuccess();

          router.push("/bookings/view");
          return result;
        } catch (error) {
          console.error("Error submitting booking:", error);
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
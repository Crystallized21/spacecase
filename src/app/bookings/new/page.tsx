"use client";

import {useEffect, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Header} from "@/components/dashboard/Header";
import {Textarea} from "@/components/ui/textarea";
import {BookOpenIcon, Building, CalendarIcon, ClockIcon, MapPinIcon, ScrollTextIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import * as Sentry from "@sentry/nextjs";
import {useRouter} from "next/navigation";


export default function BookingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

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
  const [subjects, setSubjects] = useState<Array<{ id: string, name: string, code?: string }>>([]);
  const [slots, setSlots] = useState<Array<{
    id: number;
    number: number;
    day: string;
    startTime: string;
    endTime: string;
  }>>([]);

  // format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // common subjects for the select dropdown
  useEffect(() => {
    fetch("/api/bookings/commons")
      .then(res => res.json())
      .then(data => setCommons(data))
      .catch(() => setCommons([]));
  }, []);

  // rooms based on selected common
  useEffect(() => {
    if (!formData.common) {
      setRooms([]);
      return;
    }
    fetch(`/api/bookings/rooms?common=${encodeURIComponent(formData.common)}`)
      .then(res => res.json())
      .then(data => setRooms(data))
      .catch(() => setRooms([]));
  }, [formData.common]);

  // subjects for the select dropdown
  useEffect(() => {
    fetch("/api/bookings/subjects")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(error => {
        console.error("Error fetching subjects:", error);
        setSubjects([]);
      });
  }, []);

  // slots based on selected date
  useEffect(() => {
    if (!formData.date) {
      setSlots([]);
      return;
    }

    const dayName = formData.date.toLocaleDateString('en-US', {weekday: 'long'});

    fetch(`/api/bookings/slots?day=${encodeURIComponent(dayName)}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSlots(data);
        } else {
          console.error("Unexpected data format:", data);
          setSlots([]);
        }
      })
      .catch(error => {
        console.error("Error fetching slots:", error);
        setSlots([]);
      });
  }, [formData.date]);

  const handleChange = (key: string, value: string | Date | undefined) => {
    setFormData({...formData, [key]: value});
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Book a Room</h1>
          <p className="text-gray-600">Complete the form below to reserve your teaching space</p>
        </div>

        <Card className="max-w-2xl mx-auto shadow-md">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Booking Details</CardTitle>
            <CardDescription>All fields are required unless noted otherwise</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-primary"/>
                Subject
              </Label>
              <Select onValueChange={(val) => handleChange("subject", val)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select subject"/>
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary"/>
                Common
              </Label>
              <Select onValueChange={(val) => handleChange("common", val)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select Common"/>
                </SelectTrigger>
                <SelectContent>
                  {commons.map((common) => (
                    <SelectItem key={common} value={common}>{common}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-primary"/>
                Room
              </Label>
              <Select onValueChange={(val) => handleChange("room", val)}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select room"/>
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room} value={room}>{room}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary"/>
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {formData.date ? format(formData.date, "PPP") : <span>Select a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => handleChange("date", date)}
                    disabled={[
                      {before: new Date()}, // Disable past dates
                      {dayOfWeek: [0, 6]}   // Disable weekends
                    ]}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary"/>
                Time Slot
              </Label>
              <Select
                onValueChange={(val) => handleChange("slot", val)}
                disabled={!formData.date}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select time slot"/>
                </SelectTrigger>
                <SelectContent>
                  {slots.map((slot) => (
                    <SelectItem key={slot.id} value={slot.number.toString()}>
                      Period {slot.number} ({formatTime(slot.startTime)}-{formatTime(slot.endTime)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!formData.date && (
                <p className="text-sm text-gray-500 mt-1">Please select a date first</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ScrollTextIcon className="h-4 w-4 text-primary"/>
                Justification <span className="text-sm text-gray-500">(optional)</span>
              </Label>
              <Textarea
                placeholder="Explain the reason for this booking if it's a repeat or special request..."
                className="min-h-[100px] bg-white"
                onChange={(e) => handleChange("justification", e.target.value)}
                value={formData.justification}
              />
            </div>

            <div className="pt-4">
              <Button
                className="w-full py-6 text-md font-medium"
                onClick={handleSubmit}
                disabled={loading || !formData.subject || !formData.room || !formData.date || !formData.slot}
              >
                {loading ? "Submitting..." : "Submit Booking"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
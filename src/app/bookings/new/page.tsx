"use client";

import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Header} from "@/components/dashboard/Header";
import {Textarea} from "@/components/ui/textarea";
import {BookOpenIcon, Building, CalendarIcon, ClockIcon, Loader2, MapPinIcon, ScrollTextIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {cn, formatTime} from "@/lib/utils";
import {useBookingForm} from "@/hooks/useBookingForm";

export default function BookingPage() {
  const {
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
    handleSubmit: baseHandleSubmit,
  } = useBookingForm();

  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    await baseHandleSubmit({
      onSuccess: () => setSuccess(true),
    })
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
            {/* Subject Dropdown */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpenIcon className="h-4 w-4 text-primary"/>Subject
              </Label>
              <div className="relative">
                <Select
                  onValueChange={(val) => handleChange("subject", val)}
                  value={formData.subject}
                  disabled={loadingSubjects}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select subject"/>
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem
                        key={`${subject.id}-${subject.line}`}
                        value={`${subject.id}-${subject.line}`}
                      >
                        {subject.code ? `${subject.code} - ${subject.name}` : subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {loadingSubjects && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary"/>
                )}
              </div>
            </div>

            {/* Common Dropdown */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary"/>Common
              </Label>
              <div className="relative">
                <Select
                  onValueChange={(val) => handleChange("common", val)}
                  value={formData.common}
                  disabled={!formData.subject || loadingCommons}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder={!formData.subject ? "Select subject first" : "Select Common"}/>
                  </SelectTrigger>
                  <SelectContent>
                    {commons.map((common) =>
                      <SelectItem key={common} value={common}>
                        {common}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {loadingCommons && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary"/>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-primary"/>Room
              </Label>
              <div className="relative">
                <Select
                  onValueChange={(val) => handleChange("room", val)}
                  value={formData.room}
                  disabled={!formData.common || rooms.length === 0 || loadingRooms}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select room"/>
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => <SelectItem key={room} value={room}>{room}</SelectItem>)}
                  </SelectContent>
                </Select>
                {loadingRooms && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary"/>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary"/>Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline"
                          className={cn("w-full justify-start text-left font-normal bg-white", !formData.date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4"/>
                    {formData.date ? format(formData.date, "PPP") : <span>Select a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={formData.date} onSelect={(date) => handleChange("date", date)}
                            disabled={[{before: new Date()}, {dayOfWeek: [0, 6]}]}/>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClockIcon className="h-4 w-4 text-primary"/>Time Slot
              </Label>
              <div className="relative">
                <Select
                  onValueChange={(val) => handleChange("slot", val)}
                  value={formData.slot}
                  disabled={!formData.date || slots.length === 0 || loadingSlots}
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
                {loadingSlots && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary"/>
                )}
              </div>
              {!formData.date && <p className="text-sm text-gray-500 mt-1">Please select a date first</p>}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ScrollTextIcon className="h-4 w-4 text-primary"/>
                Justification <span className="text-sm text-gray-500">(optional)</span>
              </Label>
              <Textarea placeholder="Explain the reason for this booking..." className="min-h-[100px] bg-white"
                        onChange={(e) => handleChange("justification", e.target.value)} value={formData.justification}/>
            </div>

            <div className="pt-4">
              <Button
                className="w-full py-6 text-md font-medium transition"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.subject || !formData.room || !formData.date || !formData.slot}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5"/> Submitting...
                  </span>
                ) : "Submit Booking"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

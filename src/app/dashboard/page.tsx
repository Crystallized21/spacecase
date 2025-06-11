"use client"

import {Header} from "@/components/dashboard/Header"
import {TimetableCard} from "@/components/dashboard/timetable/TimetableCard"
import {NoticesCard} from "@/components/dashboard/NoticesCard"
import type {TimetableEntryProps} from "@/components/dashboard/timetable/TimetableEntry"

export default function Dashboard() {
  const timetableEntries: TimetableEntryProps[] = [
    {
      id: 1,
      period: "Period X",
      subject: "LA /ITtime",
      time: "9:00am - 10:30am",
      duration: "XXmins",
      line: "Line 1",
      location: "Pungawerewere",
      room: "Presentation Room",
      color: "bg-green-500",
      hasBookButton: false,
    },
    {
      id: 2,
      period: "Period X",
      subject: "ENG2",
      time: "2:05pm - 2:55pm",
      duration: "XXmins",
      line: "Line 1",
      location: "Pungawerewere",
      room: "Presentation Room",
      color: "bg-blue-500",
      hasBookButton: false,
    },
    {
      id: 3,
      period: "Period X",
      subject: "ENG2",
      time: "2:05pm - 2:55pm",
      duration: "XXmins",
      line: "Line 1",
      location: "Pungawerewere",
      room: "Presentation Room",
      color: "bg-blue-500",
      hasBookButton: false,
    },
    {
      id: 4,
      period: "Period X",
      subject: "ENG2",
      time: "2:05pm - 2:55pm",
      duration: "XXmins",
      line: "Line 1",
      location: "Pungawerewere",
      room: "Presentation Room",
      color: "bg-blue-500",
      hasBookButton: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header/>

      <main className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TimetableCard entries={timetableEntries}/>
          </div>

          <div>
            <NoticesCard/>
          </div>
        </div>
      </main>
    </div>
  )
}

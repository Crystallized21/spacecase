import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"

export interface TimetableEntryProps {
  id: number
  period: string
  subject: string
  time: string
  duration: string
  line: string
  location: string
  room: string
  color: string
  hasBookButton: boolean
}

export function TimetableEntry({entry}: { entry: TimetableEntryProps }) {
  return (
    <div className="flex items-center border rounded-lg p-4 relative">
      <div className={`w-1 self-stretch ${entry.color} rounded-full mr-4`}/>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <h3 className="font-semibold text-gray-900">{entry.period}</h3>
              <span className="text-sm text-gray-600">{entry.time}</span>
              <span className="text-sm text-gray-600">{entry.duration}</span>
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {entry.line}
              </Badge>
            </div>
            <p className="font-medium text-gray-900 mt-1">{entry.subject}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">{entry.location}</p>
              <p className="text-sm text-gray-600">{entry.room}</p>
            </div>
            {entry.hasBookButton && (
              <Button size="sm" className="bg-gray-800 hover:bg-gray-700">
                Book Space
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

import {ChevronDown, Rocket, User} from "lucide-react"
import {Button} from "@/components/ui/button"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <nav className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-gray-700"/>
            <span className="font-semibold text-gray-900">ID</span>
          </div>
          <div className="flex items-center space-x-6">
            <span className="font-medium text-gray-900">Dashboard</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900">
                  <span>Bookings</span>
                  <ChevronDown className="h-4 w-4"/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem>View Bookings</DropdownMenuItem>
                <DropdownMenuItem>New Booking</DropdownMenuItem>
                <DropdownMenuItem>Booking History</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-gray-700">Timetable</span>
            <span className="text-gray-700">Settings</span>
          </div>
        </nav>
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
          <User className="h-6 w-6 text-white"/>
        </div>
      </div>
    </header>
  )
}

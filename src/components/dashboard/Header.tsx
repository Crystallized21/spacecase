"use client"

import {Rocket} from "lucide-react"
import {SignedIn, UserButton, useUser} from "@clerk/nextjs"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function Header() {
  const {isLoaded} = useUser()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-gray-700"/>
            <span className="font-semibold text-gray-900">ID</span>
          </div>

          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className="font-medium text-gray-900 px-3 py-2 cursor-pointer">Dashboard</NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">Bookings</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[200px]">
                    <NavigationMenuLink
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                      <div className="text-sm font-medium leading-none">View Bookings</div>
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                      <div className="text-sm font-medium leading-none">New Booking</div>
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                      <div className="text-sm font-medium leading-none">Booking History</div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="text-gray-700 hover:text-gray-900 px-3 py-2 cursor-pointer">
                  Timetable
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink className="text-gray-700 hover:text-gray-900 px-3 py-2 cursor-pointer">
                  Settings
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div>
          {isLoaded ? (
            <SignedIn>
              <UserButton
                showName={true}
                appearance={{
                  elements: {
                    userButtonOuterIdentifier: "dark:text-white",
                  },
                }}
              />
            </SignedIn>
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"/>
          )}
        </div>
      </div>
    </header>
  )
}

"use client"

import {Eye, NotebookPen, Rocket} from "lucide-react"
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
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-gray-700"/>
            <span className="font-semibold text-gray-900">SpaceCase</span>
          </div>

          <NavigationMenu viewport={false}>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/dashboard"
                  className="font-medium text-gray-900 px-3 py-2 cursor-pointer">Dashboard</NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-gray-700 hover:text-gray-900">Bookings</NavigationMenuTrigger>
                <NavigationMenuContent className="z-50">
                  <div className="grid gap-4 py-2 px-2 w-[200px]">
                    <NavigationMenuLink
                      href="/bookings/new"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                      <div className="text-sm font-medium leading-none flex items-center gap-2"><NotebookPen
                        className="h-4 w-4"/>
                        New Booking
                      </div>
                    </NavigationMenuLink>
                    <NavigationMenuLink
                      href="/bookings/view"
                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer">
                      <div className="text-sm font-medium leading-none flex items-center gap-2"><Eye
                        className="h-4 w-4"/>
                        View Bookings
                      </div>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
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

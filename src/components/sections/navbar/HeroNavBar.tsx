import { Button } from "../../ui/button";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import LaunchUI from "../../logos/launch-ui";
import Link from "next/link";
import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs";
import {ModeToggle} from "@/components/ModeToggle";

export default function HeroNavBar() {
  return (
    <header className="sticky top-0 z-50 -mb-4 px-4 pb-4">
      <div className="fade-bottom absolute left-0 h-24 w-full bg-background/15 backdrop-blur-lg"></div>
      <div className="relative mx-auto max-w-container">
        <NavbarComponent>
          <NavbarLeft>
            <Link
              href="/"
              className="flex items-center gap-2 text-xl font-bold"
            >
              <LaunchUI/>
              SpaceCase
            </Link>
            <ModeToggle/>
          </NavbarLeft>
          <NavbarRight>
            <SignedOut>
              <Button variant="default" asChild>
                <SignInButton/>
              </Button>
            </SignedOut>
            <SignedIn>
              <
                UserButton
                showName={true}
                appearance={{
                  elements: {
                    userButtonOuterIdentifier: 'dark:text-white'
                  }
                }}
              />
            </SignedIn>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}

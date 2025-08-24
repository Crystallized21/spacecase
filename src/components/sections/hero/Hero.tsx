import type {ReactNode} from "react";
import {cn} from "@/lib/utils";

import {Button, type ButtonProps} from "../../ui/button";
import {Badge} from "../../ui/badge";
import {ArrowRightIcon} from "lucide-react";
import {Section} from "../../ui/section";
import {Mockup, MockupFrame} from "../../ui/mockup";
import Glow from "../../ui/glow";
import Github from "../../logos/github";
import Screenshot from "../../ui/screenshot";
import {SignedIn, SignedOut, SignInButton} from "@clerk/nextjs";

interface HeroButtonProps {
  href: string;
  text: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
}

interface HeroProps {
  title?: string;
  description?: string;
  mockup?: ReactNode | false;
  badge?: ReactNode | false;
  buttons?: HeroButtonProps[] | false;
  className?: string;
}

export default function Hero({
  title = "SpaceCase",
  description = "A tool for teachers to simplify room management and scheduling at Ormiston Senior College.",
  mockup = (
    <Screenshot
      srcLight="/images/hero.png"
      srcDark="/images/hero.png"
      alt="screenshot"
      width={1248}
      height={765}
      className="w-full"
    />
  ),
  badge = (
    <Badge variant="outline" className="animate-appear">
      <span className="text-muted-foreground">
        In development.
      </span>
    </Badge>
  ),
  className,
}: HeroProps) {
  return (
    <Section
      className={cn(
        "fade-bottom overflow-hidden pb-0 sm:pb-0 md:pb-0",
        className,
      )}
    >
      <div className="max-w-container mx-auto flex flex-col gap-12 pt-2 sm:gap-24">
        <div className="flex flex-col items-center gap-6 text-center sm:gap-12">
          {badge !== false && badge}
          <h1
            className="animate-appear from-foreground to-foreground dark:to-muted-foreground relative z-10 inline-block bg-linear-to-r bg-clip-text text-4xl leading-tight font-semibold text-balance text-transparent drop-shadow-2xl sm:text-6xl sm:leading-tight md:text-8xl md:leading-tight">
            {title}
          </h1>
          <p
            className="text-md animate-appear text-muted-foreground relative z-10 max-w-[740px] font-medium text-balance opacity-0 delay-100 sm:text-xl">
            {description}
          </p>
          <div className="animate-appear relative z-10 flex justify-center gap-4 opacity-0 delay-300">
            <SignedOut>
              <Button variant="default" size="lg" asChild>
                <SignInButton/>
              </Button>
            </SignedOut>
            <SignedIn>
              <Button variant="default" size="lg" asChild>
                <a href="/dashboard">
                  Go to Dashboard
                  <ArrowRightIcon className="ml-2 size-5"/>
                </a>
              </Button>
            </SignedIn>
            <Button variant="glow" size="lg" asChild>
              <a
                href="https://github.com/Ormiston-Senior-College-NZ/finalassessmentas91906-0r-as91903-2025-Crystallized21">
                <Github className="mr-2 size-4"/>
                Github
              </a>
            </Button>
          </div>
          {mockup !== false && (
            <div className="relative w-full pt-12">
              <MockupFrame
                className="animate-appear opacity-0 delay-700"
                size="small"
              >
                <Mockup
                  type="responsive"
                  className="bg-background/90 w-full rounded-xl border-0"
                >
                  {mockup}
                </Mockup>
              </MockupFrame>
              <Glow
                variant="top"
                className="animate-appear-zoom opacity-0 delay-1000"
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}

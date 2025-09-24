import { Button, Tooltip } from "@belousovjr/uikit";
import { ReactNode, useMemo, ComponentProps } from "react";
import { TutorialStatusOption } from "../lib/types";
import useTutorial from "../lib/helpers/useTutorial";
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";

export default function TutorialTip({
  hidden,
  disabled,
  status,
  defaultPosition = "bottom",
  className,
  children,
}: {
  hidden?: boolean;
  disabled?: boolean;
  status: TutorialStatusOption;
  defaultPosition?: ComponentProps<typeof Tooltip>["defaultPosition"];
  className?: string;
  children: ReactNode;
}) {
  const content = useMemo<ReactNode>(() => {
    switch (status) {
      case "SEARCH":
        return (
          <div className="grid gap-4">
            <div>
              <span className="font-bold"> Welcome to The Babel Scroll.</span>
              <span className="block text-general-60 text-xs">
                inspired by the{" "}
                <Link
                  target="_blank"
                  href="https://en.wikipedia.org/wiki/The_Library_of_Babel"
                  className="inline-flex items-end gap-0.5 underline decoration-2 underline-offset-4 decoration-primary-100 transition hover:text-white"
                >
                  Library of Babel
                  <ArrowUpRightIcon size={12} />
                </Link>
              </span>
            </div>
            <div>
              Start your <span className="font-bold">Search</span> in a scroll
              of <span className="font-bold">27⁸⁰-1</span> entries.
              <br />
              Only latin characters and spaces are allowed.
            </div>
          </div>
        );
      case "SHOW_RESULT":
        return "Click to see search result details.";
      case "LOGIN_TO_LIKE":
        return (
          <span>
            Please log in to be able to <span className="font-bold">Like</span>{" "}
            posts.
          </span>
        );
      case "CHECK_ACTIONS":
        return "All activities are now available to you.";
      case "FINAL":
        return null;
      default:
        const unknown: unknown = status;
        throw Error(`Unknown status: ${unknown}`);
    }
  }, [status]);

  const { lastActiveStatus, checkStatus } = useTutorial();

  return !hidden ? (
    <Tooltip
      isOpen={lastActiveStatus === status && !disabled}
      defaultPosition={defaultPosition}
      className={`p-7 z-40 bg-black ${className ?? ""}`}
      onClick={(e) => e.stopPropagation()}
      arrowDistance={13}
      content={
        <div className="grid gap-6">
          {content}
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                checkStatus("FINAL");
              }}
              size="sm"
              variant="destructiveSecondary"
            >
              Skip Tutorial
            </Button>
          </div>
        </div>
      }
    >
      <span className="flex rounded-md outline-3 outline-transparent outline-offset-3 group-data-[opened=true]/tooltip-activator:outline-yellow-100">
        {children}
      </span>
    </Tooltip>
  ) : (
    children
  );
}

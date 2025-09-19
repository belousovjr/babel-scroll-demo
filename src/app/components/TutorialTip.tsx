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
      // case "INTRO":
      //   return "INTRO";
      // <div className="grid gap-2">
      //   <span>
      //     <span className="font-bold">Edit your Task</span> by clicking:{" "}
      //     <EditIcon className="inline ml-3 bg-primary-70 outline-2 outline-primary-70 rounded-sm" />
      //   </span>
      //   <span className="hidden lg:inline">
      //     Or <span className="font-bold">Change Status</span> by holding
      //     down:{" "}
      //     <GripHorizontalIcon className="inline ml-3 bg-primary-70 outline-2 outline-primary-70 rounded-sm" />
      //   </span>
      // </div>
      case "SEARCH":
        return (
          <div className="grid gap-4">
            <div>
              <span className="font-bold"> Welcome to the Babel Scroll.</span>
              <span className="flex gap-2 items-center text-general-60 text-xs">
                inspired by the
                <Link
                  target="_blank"
                  href="https://en.wikipedia.org/wiki/The_Library_of_Babel"
                  className="inline-flex items-end gap-0.5 underline decoration-2 underline-offset-4 decoration-primary-100 transition hover:text-white"
                >
                  The Babylonian Library
                  <ArrowUpRightIcon size={12} />
                </Link>
              </span>
            </div>
            <div>
              Start your <span className="font-bold">Search</span> in a list of
              (<span className="font-bold">27⁸⁰ - 1</span>) items.
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
            >
              Finish Tutorial
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

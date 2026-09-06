import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/proposals/")({
  beforeLoad: () => {
    throw redirect({ to: "/actions" });
  },
});

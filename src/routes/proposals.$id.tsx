import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/proposals/$id")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/actions/$id", params: { id: params.id } });
  },
});

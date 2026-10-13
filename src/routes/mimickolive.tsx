import { createFileRoute, redirect } from "@tanstack/react-router";

// Short link printed on the Mimicko Live poster: www.litville.net/mimickolive
export const Route = createFileRoute("/mimickolive")({
  beforeLoad: () => {
    throw redirect({ to: "/event/$slug", params: { slug: "mimickolive" }, statusCode: 301 });
  },
});

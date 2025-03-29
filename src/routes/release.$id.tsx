import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { discogsTracklistOptions } from "~/utils/queries";

export const Route = createFileRoute("/release/$id")({
  component: ReleaseComponent,
});

function ReleaseComponent() {
  const { id } = Route.useParams();
  const { data } = useQuery(discogsTracklistOptions(Number(id)));

  console.log({
    id,
    data,
  });

  return <div>Hello "/release/$id"!</div>;
}

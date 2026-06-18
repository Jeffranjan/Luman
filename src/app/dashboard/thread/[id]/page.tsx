import { getSession } from "~/server/better-auth/server";
import { redirect } from "next/navigation";
import { ThreadView } from "~/components/inbox/thread-view";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  
  if (!session) {
    redirect("/");
  }

  const { id } = await params;

  return (
    <div className="flex flex-col h-full w-full bg-background">
      <ThreadView threadId={id} />
    </div>
  );
}

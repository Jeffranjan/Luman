import { getSession } from "~/server/better-auth/server";
import { HydrateClient } from "~/trpc/server";
import { ThreadList } from "~/components/inbox/thread-list";

export default async function DashboardInboxPage() {
  const session = await getSession();

  return (
    <HydrateClient>
      <div
        className="flex h-full w-full flex-col"
        style={{ background: "var(--bg)", color: "var(--text)" }}
      >
        <header
          className="flex h-14 shrink-0 items-center px-6"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h1
            className="text-sm font-semibold"
            style={{ color: "var(--text)" }}
          >
            Inbox
          </h1>
          <div className="flex-1" />
          <div
            className="flex items-center gap-4 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            <span>{session?.user?.name}</span>
          </div>
        </header>
        <ThreadList />
      </div>
    </HydrateClient>
  );
}

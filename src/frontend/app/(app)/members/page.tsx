import MembersPageClient, { type Member } from "./page.client";
import { serverFetchJson } from "@/lib/server-api";

const PAGE_SIZE = 20;

async function getInitialMembers() {
  const collected: Member[] = [];
  let lastId: number | undefined;
  let safety = 0;

  while (safety < 20) {
    const params = new URLSearchParams();
    params.set("limit", String(PAGE_SIZE));
    if (lastId !== undefined) params.set("last-item-id", String(lastId));

    const payload = await serverFetchJson<{ list?: Member[] }>(
      `/members?${params.toString()}`,
    );
    const list = Array.isArray(payload?.list) ? payload.list : [];

    collected.push(...list);

    if (list.length < PAGE_SIZE) break;
    lastId = list[list.length - 1]?.id;
    if (lastId === undefined) break;
    safety += 1;
  }

  collected.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return collected;
}

export default async function MembersPage() {
  const initialMembers = await getInitialMembers();

  return <MembersPageClient initialMembers={initialMembers} />;
}

import { serverApiBase, clientApiBase } from "./apiBase";

export type MailListItem = {
  id: number;
  from_addr: string;
  subject: string;
  date: string;
  size: number;
  is_spam: boolean;
};

export type Attachment = {
  id: number;
  filename?: string;
  content_type: string;
  size: number;
  is_inline: boolean;
  content_id?: string;
};

export interface MailDetail extends MailListItem {
  to_addrs: string;
  raw: string;
  headers: Record<string, string>;
  text?: string;
  html?: string;
  cid_map: Record<string, string>;
  attachments: Attachment[];
}
export type MailStats = {
  total: number;
  recipients: number;
  avg_per_day: number;
  max_size: number;
  last_mail: string | null;
  top_senders: [string, number][];
  top_subjects: [string, number][];
  timeline: [string, number][];
  with_attachment: number;
};

async function ok<T>(res: Response): Promise<T | null> {
  if (!res.ok) {
    if (res.status === 404) {
      return null;
    }
    throw new Error(`API ${res.status} ${res.statusText}`);
  }
  try {
    return await res.json();
  } catch (e) {
    return null;
  }
}

// Server routes

export async function listMails(params?: { q?: string; mailbox?: string }): Promise<MailListItem[] | null> {
  let url = `${serverApiBase}/mails`;
  const qs: string[] = [];
  if (params?.q) qs.push(`q=${encodeURIComponent(params.q)}`);
  if (params?.mailbox) qs.push(`mailbox=${encodeURIComponent(params.mailbox)}`);
  if (qs.length) url += `?${qs.join("&")}`;
  const res = await fetch(url, { cache: "no-store", next: { revalidate: 0 } });
  return ok(res);
}

export async function getMail(id: number): Promise<MailDetail | null> {
  const res = await fetch(`${serverApiBase}/mails/${id}`, { cache: "no-store", next: { revalidate: 0 } });
  return ok(res);
}

export async function apiHealth(): Promise<{ status: string } | null> {
  const res = await fetch(`${serverApiBase}/health`, { cache: "no-store", next: { revalidate: 0 } });
  return ok(res);
}

export async function fullHealth(): Promise<{
  status: string;
  smtp: { ok: boolean; latency_ms: number | null; banner?: string | null; error?: string | null };
  db: { ok: boolean; type: string; size_bytes: number | null };
}> {
  const res = await fetch(`${serverApiBase}/health/full`, { cache: "no-store", next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return res.json();
}

export async function assertMail(params: { subject_contains?: string; to_addr?: string }): Promise<{ assert: boolean } | null> {
  const res = await fetch(`${serverApiBase}/mails/assert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    cache: "no-store",
  });
  return ok(res);
}

export async function getStats(): Promise<MailStats> {
  const res = await fetch(`${serverApiBase}/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("API /stats " + res.status);
  return res.json();
}


// Client routes

export async function deleteMail(id: number): Promise<{ deleted: boolean }> {
  const res = await fetch(`${clientApiBase}/mails/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return res.json();
}

export async function clearMails(): Promise<{ status: string }> {
  const res = await fetch(`${clientApiBase}/mails`, { method: "DELETE" });
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return res.json();
}

export async function downloadMail(id: number): Promise<Blob> {
  const res = await fetch(`${clientApiBase}/mails/${id}/download`);
  if (!res.ok) throw new Error(`API ${res.status} ${res.statusText}`);
  return res.blob();
}
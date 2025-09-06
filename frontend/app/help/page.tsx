export const revalidate = 0;

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Send test mails</h1>
        <div className="text-base text-gray-500">How to test the local SMTP server</div>
      </div>

      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-2">
        <p>
          The SMTP server listens by default on <code className="font-mono bg-gray-100 px-1 rounded">{'localhost:2525'}</code>.
          Here are some tested snippets:
        </p>
      </div>

      <Section title="Python 3">
        <Code>
{`python3 -c '
import smtplib
from email.message import EmailMessage
m=EmailMessage()
m["From"]="alice@example.com"
m["To"]="bob@postdock.local"
m["Subject"]="Hello PostDock (Python)"
m.set_content("Body")
s=smtplib.SMTP("localhost",2525,timeout=5)
s.send_message(m)
s.quit()'
`}
        </Code>
      </Section>

      <Section title="CLI (swaks)">
        <Code>
{`swaks --server localhost:2525 \\
  --from alice@example.com \\
  --to bob@postdock.local \\
  --data "Subject: Hello PostDock (swaks)\\n\\nBody"
`}
        </Code>
      </Section>

<Section title="Telnet (manual)">
  <div className="space-y-2 text-sm text-gray-700">
    <p>
      You can test the SMTP server interactively with <code className="font-mono bg-gray-100 px-1 rounded">telnet</code>:
    </p>
    <Code>
{`telnet localhost 2525`}
    </Code>
    <p className="text-xs text-gray-500">
      Then type the following commands (press Enter after each line):
    </p>
    <Code>
{`EHLO test
MAIL FROM:<alice@example.com>
RCPT TO:<bob@postdock.local>
DATA
Subject: Hello PostDock (Telnet)

Body
.
QUIT`}
    </Code>
    <p className="text-xs text-gray-500">
      Note: After <code className="font-mono bg-gray-100 px-1 rounded">DATA</code> enter your message, then a single dot <code className="font-mono bg-gray-100 px-1 rounded">.</code> on a new line to finish.
    </p>
  </div>
</Section>

      <div className="rounded-xl border bg-white shadow-sm p-5 space-y-2 text-sm text-gray-700">
        <p>
          <strong>After sending, check:</strong> Open the inbox or use the API: <code className="font-mono bg-gray-100 px-1 rounded">GET /mails</code>.
        </p>
        <p>
          <strong>Common pitfalls:</strong> Missing dot line after <code className="font-mono bg-gray-100 px-1 rounded">DATA</code>, wrong port, container DNS vs. host (<span className="font-mono bg-gray-100 px-1 rounded">api:2525</span> in Compose, <span className="font-mono bg-gray-100 px-1 rounded">localhost:2525</span> outside).
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}



import dynamic from "next/dynamic";
const CopyButton = dynamic(() => import("@/components/CopyButton"), { ssr: false });

function Code({ children }: { children: React.ReactNode }) {
  const code = typeof children === "string" ? children : Array.isArray(children) ? children.join("") : String(children);
  return (
    <div className="relative group">
      <pre className="whitespace-pre-wrap bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-auto text-sm font-mono text-gray-800">
        {children}
      </pre>
      <CopyButton code={code} />
    </div>
  );
}
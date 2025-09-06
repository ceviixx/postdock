"use client";

import "./MailTabs.sim.css";

import { useState } from "react";
import { MailDetail } from "@/lib/api";
import { IconAttachment, IconDocument, IconDownload } from "./Icons";
import { clientApiBase } from "@/lib/apiBase";

export function MailTabs({ mail }: { mail: MailDetail }) {

  const availableTabs = [
    ...(mail.html ? [{ key: "html", label: "HTML" }] : []),
    ...(mail.text ? [{ key: "plain", label: "Plain" }] : []),
    { key: "raw", label: "Source" },
    { key: "headers", label: "Headers" },
    ...(mail.attachments && mail.attachments.length > 0
      ? [{ key: "attachments", label: "Attachments", badge: mail.attachments.length }]
      : []),
  ];

  const defaultTab = mail.html ? "html" : mail.text ? "plain" : "raw";
  const [tab, setTab] = useState(defaultTab);
  const [htmlHover, setHtmlHover] = useState(false);

  const clientOptions = [
    { key: 'default', label: 'HTML' },
    { key: 'gmail', label: 'Gmail' },
    { key: 'outlook', label: 'Outlook' },
    { key: 'apple', label: 'Apple Mail' },
  ];
  const [client, setClient] = useState<'default' | 'gmail' | 'outlook' | 'apple'>('default');

  function renderHtmlWithCid(html: string) {
    if (!html) return null;
    let out = html;
    for (const [cid, url] of Object.entries(mail.cid_map || {})) {
      const absUrl = url.startsWith("/") ? clientApiBase + url : url;
      out = out.replaceAll(`cid:${cid}`, absUrl);
    }
    return <div dangerouslySetInnerHTML={{ __html: out }} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 relative">
        {availableTabs.map(t => (
          t.key === 'html' ? (
            <div
              key="html"
              onMouseEnter={() => setHtmlHover(true)}
              onMouseLeave={() => setHtmlHover(false)}
            >
              <div
                className={`relative flex items-center overflow-visible rounded-full pt-0 border border-gray-100 bg-gray-100 transition-all duration-300${htmlHover ? ' pr-2' : ''}`}
              >
                <button
                  className={`py-1.5 rounded-full transition text-sm font-medium focus:outline-none flex items-center gap-1
            ${tab === 'html' || htmlHover
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black"}
            ${client !== 'default' ? "pl-4 pr-2.5" : "px-4"}
          `}
                  onClick={() => setTab('html')}
                  type="button"
                >
                  HTML
                  {client !== 'default' && (
                    <span className="ml-2 inline-flex items-center justify-center pl-2 py-0.2 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                      {clientOptions.find(o => o.key === client)?.label}
                      <button
                        className="ml-0.5 w-4 h-4 flex items-center justify-center rounded-full hover:bg-gray-300 text-gray-500 hover:text-black transition"
                        onClick={e => {
                          e.stopPropagation();
                          setClient('default');
                        }}
                        tabIndex={0}
                      >
                        ×
                      </button>
                    </span>
                  )}
                </button>
                {htmlHover ? (
                  <div className="flex items-center gap-1 ml-2">
                    {clientOptions.filter(opt => opt.key !== 'default' && opt.key !== client).map(opt => (
                      <button
                        key={opt.key}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:scale-105 transition-colors
                  ${client === opt.key ? 'ring-2 ring-black' : ''}`}
                        onClick={() => {
                          setClient(opt.key as typeof client);
                          setTab('html');
                        }}
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : (
            <button
              key={t.key}
              className={`px-4 py-1.5 rounded-full transition text-sm font-medium focus:outline-none flex items-center gap-1
        ${tab === t.key
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-black hover:text-white"}
      `}
              onClick={() => setTab(t.key)}
              type="button"
            >
              {t.label}
              {t.key === "attachments" && t.badge ? (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-200 text-gray-700">
                  {t.badge}
                </span>
              ) : null}
            </button>
          )
        ))}
      </div>

      {(tab === "html" || tab === "plain" || tab === "raw" || tab === "headers") && (
        <div
          className={
            `rounded-xl bg-white p-4 min-h-[120px] border ` +
            (tab === 'html' && client !== 'default'
              ? (client === 'gmail' ? 'border-[#d93025]' : client === 'outlook' ? 'border-[#0072c6]' : client === 'apple' ? 'border-[#333]' : 'border-gray-200')
              : 'border-gray-200')
          }
        >
          {tab === "html" && mail.html && (
            <>
              {client && client !== 'default' && (
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                  <span className="ml-2 text-xs text-gray-400 italic">Simulated preview – may differ from real client.</span>
                </div>
              )}
              <div
                className={
                  'rounded-lg overflow-hidden ' +
                  (client === 'gmail' ? 'gmail-sim' : client === 'outlook' ? 'outlook-sim' : client === 'apple' ? 'apple-sim' : '')
                }
              >
                <div
                  className={
                    client && client !== 'default' && client === 'gmail' ? 'gmail-sim' :
                      client && client !== 'default' && client === 'outlook' ? 'outlook-sim' :
                        client && client !== 'default' && client === 'apple' ? 'apple-sim' :
                          ''
                  }
                  style={{ minHeight: 120 }}
                >
                  {renderHtmlWithCid(mail.html)}
                </div>
              </div>
            </>
          )}
          {tab === "plain" && mail.text && (
            <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">{mail.text}</pre>
          )}
          {tab === "raw" && (
            <pre className="whitespace-pre-wrap text-xs text-gray-600 font-mono">{mail.raw || "(no source)"}</pre>
          )}
          {tab === "headers" && (
            <div className="text-xs font-mono text-gray-700 overflow-auto">
              {mail.headers && Object.entries(mail.headers).map(([k, v]) => (
                <div key={k}><span className="font-bold">{k}:</span> {v}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "attachments" && (
        <ul className="divide-y divide-gray-100 rounded-xl border bg-white shadow-sm overflow-hidden">
          {mail.attachments.length === 0 && <li className="p-6 text-center text-sm text-gray-400">No attachments</li>}
          {mail.attachments.map(att => (
            <li key={att.id} className="flex items-center gap-3 p-4">
              {att.content_type.startsWith("image/") ? (
                <img
                  src={`${clientApiBase}/mails/${mail.id}/attachments/${att.id}`}
                  alt={String(att.filename)}
                  width={32}
                  height={32}
                  className="rounded border border-gray-200 object-cover"
                  style={{ minWidth: 32, minHeight: 32 }}
                />
              ) : att.content_type === "application/pdf" ? (
                <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                  <IconDocument className="w-5 h-5" />
                </span>
              ) : (
                <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
                  <IconAttachment className="w-5 h-5" />
                </span>
              )}
              <span className="font-mono truncate max-w-[50%] text-xs">{att.filename || att.content_type}</span>
              <span className="text-xs text-gray-500">{(att.size / 1024).toFixed(1)} KB</span>
              <span className="flex-1" />
              <a
                href={`${clientApiBase}/mails/${mail.id}/attachments/${att.id}`}
                download={att.filename}
                className="text-gray-400 hover:text-blue-600 text-xs flex items-center gap-1 transition-colors"
                title="Download"
              >
                <IconDownload className="w-4 h-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

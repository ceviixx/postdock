"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import  { toast } from "react-notification-kit"
import { clientApiBase } from "@/lib/apiBase";

type LiveSSEProps = {
  route?: string;
  onEvent?: (event: MessageEvent) => void;
};

export default function LiveSSE({ route = "/events", onEvent }: LiveSSEProps) {
  const router = useRouter();
  
  useEffect(() => {
    const es = new EventSource(`${clientApiBase}${route}`, { withCredentials: false });

    es.addEventListener("mail_saved", (e) => {
      if (onEvent) onEvent(e as MessageEvent);
      router.refresh();
      if (window.location.pathname !== "/") {
        const data = JSON.parse(e.data);
        toast.show({
          title: "New email received!", 
          description: "PostDock has just received a new email.", 
          duration: 4000,
          action: {
            label: "View message",
            onClick: () => router.push(`/mail/${data.id}`)
          }
        })
      }
    });

    es.addEventListener("ping", (e) => {
      if (onEvent) onEvent(e as MessageEvent);
    });

    es.onerror = () => {
      es.close();
    };

    return () => es.close();
  }, [router, route, onEvent]);

  return null;
}

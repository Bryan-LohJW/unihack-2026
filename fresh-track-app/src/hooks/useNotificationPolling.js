import { useEffect, useRef } from "react";
import { apiAxios } from "../api";
import { NOTIFICATION_POLL_INTERVAL_MINUTES } from "../constants";

const POLL_INTERVAL_MS = NOTIFICATION_POLL_INTERVAL_MINUTES * 60 * 1000;

function showBrowserNotification(onClick) {
  const title = "FreshTrack";
  const body =
    "Some items in your inventory are expiring soon. Use these recipe suggestions!";

  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(title, { body });
    notification.onclick = () => {
      window.focus();
      notification.close();
      onClick?.();
    };
  }
}

export function useNotificationPolling(onNotificationClick) {
  const lastNotifiedIdsRef = useRef(new Set());
  const onClickRef = useRef(onNotificationClick);
  onClickRef.current = onNotificationClick;

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await apiAxios.get("/notifications/latest");
        const suggestion = data?.suggestion;
        if (!suggestion?.suggestion_id) return;

        if (lastNotifiedIdsRef.current.has(suggestion.suggestion_id)) return;

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        lastNotifiedIdsRef.current.add(suggestion.suggestion_id);
        showBrowserNotification(() =>
          onClickRef.current?.(suggestion.suggestion_id)
        );
      } catch {
        // ignore poll errors
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll(); // run once immediately

    return () => clearInterval(id);
  }, [onNotificationClick]);
}

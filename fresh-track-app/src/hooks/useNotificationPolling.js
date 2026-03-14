import { useEffect, useRef } from "react";
import { apiAxios } from "../api";
import { NOTIFICATION_POLL_INTERVAL_MINUTES } from "../constants";
import { sendNotification } from "../notifications";

const POLL_INTERVAL_MS = NOTIFICATION_POLL_INTERVAL_MINUTES * 60 * 1000;

async function showBrowserNotification(suggestionId, onClickCallback) {
  const title = "FreshTrack";
  const body =
    "Some items in your inventory are expiring soon. Use these recipe suggestions!";

  const notification = await sendNotification(title, body, suggestionId);
  if (notification) {
    notification.onclick = () => {
      window.focus();
      notification.close();
      onClickCallback?.(suggestionId);
    };
  }
}

export function useNotificationPolling(onNotificationClick) {
  const lastNotifiedIdRef = useRef(null);
  const onClickRef = useRef(onNotificationClick);
  useEffect(() => {
    onClickRef.current = onNotificationClick;
  }, [onNotificationClick]);

  useEffect(() => {
    const poll = async () => {
      try {
        const { data } = await apiAxios.get("/notifications/latest");
        const suggestion = data?.suggestion;
        if (!suggestion?.suggestion_id) return;

        if (lastNotifiedIdRef.current === suggestion.suggestion_id) return;

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        lastNotifiedIdRef.current = suggestion.suggestion_id;
        console.log("notification sent", suggestion.suggestion_id);

        showBrowserNotification(suggestion.suggestion_id, onClickRef.current);
      } catch {
        // ignore poll errors
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll(); // run once immediately

    return () => clearInterval(id);
  }, []);
}

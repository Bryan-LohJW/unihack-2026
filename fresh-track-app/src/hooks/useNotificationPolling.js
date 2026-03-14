import { useEffect, useRef } from "react";
import { apiAxios } from "../api";
import { NOTIFICATION_POLL_INTERVAL_MINUTES } from "../constants";
import { sendNotification } from "../notifications";

const POLL_INTERVAL_MS = NOTIFICATION_POLL_INTERVAL_MINUTES * 60 * 1000;

async function showBrowserNotification() {
  const title = "FreshTrack";
  const body =
    "Some items in your inventory are expiring soon. Use these recipe suggestions!";

  await sendNotification(title, body);
}

export function useNotificationPolling(onNotificationClick) {
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

        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }

        console.log("notification sent", suggestion.suggestion_id);

        showBrowserNotification();
      } catch {
        // ignore poll errors
      }
    };

    const id = setInterval(poll, POLL_INTERVAL_MS);
    poll(); // run once immediately

    return () => clearInterval(id);
  }, []);
}

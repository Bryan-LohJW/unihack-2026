import { useEffect, useRef } from "react";
import { apiAxios } from "../api";
import { NOTIFICATION_POLL_INTERVAL_MINUTES } from "../constants";
import { sendNotification } from "../notifications";

// setInterval/setTimeout overflow above 2^31-1 ms; treat 0 as rapid firing
const MAX_SAFE_INTERVAL_MS = 2147483647;
const MIN_SAFE_INTERVAL_MS = 60000; // 1 minute floor
const POLL_INTERVAL_MS = Math.max(
  MIN_SAFE_INTERVAL_MS,
  Math.min(
    NOTIFICATION_POLL_INTERVAL_MINUTES * 60 * 1000,
    MAX_SAFE_INTERVAL_MS,
  ),
);

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
  const timeoutIdRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    onClickRef.current = onNotificationClick;
  }, [onNotificationClick]);

  useEffect(() => {
    isMountedRef.current = true;
    let inFlight = false;

    const scheduleNext = () => {
      if (!isMountedRef.current) return;
      timeoutIdRef.current = setTimeout(poll, POLL_INTERVAL_MS);
    };

    const poll = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        const result = await apiAxios.get("/notifications/latest");
        if (!isMountedRef.current) return;
        const suggestion = result?.suggestion;
        if (!suggestion?.suggestion_id) return;
        if (lastNotifiedIdRef.current === suggestion.suggestion_id) return;
        if (Notification.permission === "default") {
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;
        }
        lastNotifiedIdRef.current = suggestion.suggestion_id;
        showBrowserNotification(suggestion.suggestion_id, onClickRef.current);
      } catch {
        // ignore poll errors
      } finally {
        inFlight = false;
        if (isMountedRef.current) scheduleNext();
      }
    };

    poll();

    return () => {
      isMountedRef.current = false;
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    };
  }, []);
}

import * as Sentry from "@sentry/react-native";
import * as Updates from "expo-updates";

// Errors go to the self-hosted Bugsink (https://bugsink.aiken.si), which speaks the Sentry protocol.
// Bugsink ingests error events only: no traces, sessions, replays or profiling. The DSN is public by design.
const DSN = "https://80a085a2013a47eeb98fa70859fc3b1f@bugsink.aiken.si/1";

Sentry.init({
  dsn: DSN,
  // Release builds only; `__DEV__` stays out of Bugsink.
  enabled: !__DEV__,
  environment: Updates.channel || "preview",
  // Self-hosted, so the extra debugging context stays ours (Bugsink's recommendation).
  sendDefaultPii: true,
  tracesSampleRate: 0,
  enableAutoSessionTracking: false,
  attachScreenshot: false,
});

// Tell OTA updates apart from the embedded bundle when reading a crash.
Sentry.setTag("update.embedded", String(Updates.isEmbeddedLaunch));
if (Updates.updateId) Sentry.setTag("update.id", Updates.updateId);

export { Sentry };

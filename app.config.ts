import type { ConfigContext, ExpoConfig } from "expo/config";

// OTA updates are served by the self-hosted xprem server (https://ota.aiken.si), not EAS Update.
// RELEASE_CHANNEL is set only by the production build profile (eas.json) and `pnpm ota`; every other
// build (dev client, `expo run`, preview) has updates disabled and runs its embedded bundle.
const channel = process.env.RELEASE_CHANNEL;
// Builds without updates don't need certs/certificate.pem; DISABLE_CODE_SIGNING=true skips it explicitly.
const signing = Boolean(channel) && !process.env.DISABLE_CODE_SIGNING;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? "Echo",
  slug: config.slug ?? "echo",
  runtimeVersion: { policy: "appVersion" },
  updates: {
    url: "https://ota.aiken.si/manifest",
    enabled: Boolean(channel),
    ...(signing && {
      codeSigningCertificate: "./certs/certificate.pem",
      codeSigningMetadata: { keyid: "main", alg: "rsa-v1_5-sha256" },
    }),
    // expo-updates only sends headers declared at build time; keep all three.
    requestHeaders: {
      "expo-channel-name": channel ?? "",
      "expo-app-id": config.extra?.eas?.projectId,
      // Branch surfing: the branch to serve; empty means the channel decides.
      "xprem-branch": "",
    },
  },
});

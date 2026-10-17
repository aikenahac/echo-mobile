#!/usr/bin/env node

// Publishes an OTA update to the xprem server (ota.aiken.si) on the production branch.
// Extra arguments are forwarded to `eoas publish` (e.g. -m "message", --platform ios, --rollout-percentage 10).

const { spawn } = require('node:child_process');

const RED_COLOR_TEXT = '\x1b[31m%s\x1b[0m';
const GREEN_COLOR_TEXT = '\x1b[36m%s\x1b[0m';

const CHANNEL = 'production';
// eoas exports with EXPO_NO_DOTENV=1, so the bundle's EXPO_PUBLIC_* values come from the build profile.
const profileEnv = require('../eas.json').build[CHANNEL].env ?? {};

if (!process.env.EOO_TOKEN) {
  console.error(RED_COLOR_TEXT, 'EOO_TOKEN is not set. Create an API key for the app in the xprem dashboard and export it.');
  process.exit(1);
}

const args = ['exec', 'eoas', 'publish', '--branch', CHANNEL, ...process.argv.slice(2)];
console.log(GREEN_COLOR_TEXT, `pnpm ${args.join(' ')}`);

const child = spawn('pnpm', args, {
  stdio: 'inherit',
  env: { ...process.env, ...profileEnv, RELEASE_CHANNEL: CHANNEL },
});
child.on('exit', (code) => process.exit(code ?? 1));

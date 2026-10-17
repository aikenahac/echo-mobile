#!/usr/bin/env node

// Publishes an OTA update to the xprem server (ota.aiken.si) on the production branch.
// Extra arguments are forwarded to `eoas publish` (e.g. -m "message", --platform ios, --rollout-percentage 10).

const { spawn, spawnSync } = require('node:child_process');
const { existsSync, readFileSync } = require('node:fs');
const { dirname, join } = require('node:path');
const { parseEnv } = require('node:util');

const RED_COLOR_TEXT = '\x1b[31m%s\x1b[0m';
const GREEN_COLOR_TEXT = '\x1b[36m%s\x1b[0m';

const CHANNEL = 'production';
// eoas exports with EXPO_NO_DOTENV=1, so the bundle's EXPO_PUBLIC_* values come from the build profile.
const profileEnv = require('../eas.json').build[CHANNEL].env ?? {};

// Only EOO_TOKEN is taken from .env.local: its EXPO_PUBLIC_* values point at local development.
const envLocalPath = `${__dirname}/../.env.local`;
const envLocal = existsSync(envLocalPath) ? parseEnv(readFileSync(envLocalPath, 'utf8')) : {};
const EOO_TOKEN = process.env.EOO_TOKEN ?? envLocal.EOO_TOKEN;

// Source maps go to Bugsink (https://bugsink.aiken.si), which matches them to events by debug ID.
const SENTRY_URL = 'https://bugsink.aiken.si/';
const SENTRY_ORG = 'bugsinkhasnoorgs'; // Bugsink has no organizations; this is the literal sentry-cli expects
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN ?? envLocal.SENTRY_AUTH_TOKEN;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT ?? envLocal.SENTRY_PROJECT ?? profileEnv.SENTRY_PROJECT;

if (!EOO_TOKEN) {
  console.error(RED_COLOR_TEXT, 'EOO_TOKEN is not set. Create an API token in the xprem dashboard and add it to .env.local or export it.');
  process.exit(1);
}

const args = ['exec', 'eoas', 'publish', '--branch', CHANNEL, '--dump-sourcemap', ...process.argv.slice(2)];
console.log(GREEN_COLOR_TEXT, `pnpm ${args.join(' ')}`);

const child = spawn('pnpm', args, {
  stdio: 'inherit',
  env: { ...process.env, ...profileEnv, EOO_TOKEN, RELEASE_CHANNEL: CHANNEL },
});

// @sentry/cli is a dependency of @sentry/react-native, so resolve its binary from there.
function uploadSourceMaps() {
  if (!SENTRY_AUTH_TOKEN || !SENTRY_PROJECT) {
    console.warn('SENTRY_AUTH_TOKEN / SENTRY_PROJECT not set: skipping source map upload to Bugsink (stack traces will be minified).');
    return;
  }
  const rnPackage = require.resolve('@sentry/react-native/package.json');
  const cliDir = dirname(require.resolve('@sentry/cli/package.json', { paths: [rnPackage] }));
  const cli = join(cliDir, 'bin', 'sentry-cli');
  const result = spawnSync(
    cli,
    ['--url', SENTRY_URL, 'sourcemaps', '--org', SENTRY_ORG, '--project', SENTRY_PROJECT, 'upload', 'dist'],
    { stdio: 'inherit', env: { ...process.env, SENTRY_AUTH_TOKEN } }
  );
  if (result.status !== 0) {
    // The OTA update is already published; a failed upload must not report the publish as failed.
    console.warn('Source map upload to Bugsink failed (the OTA update itself was published).');
  }
}

child.on('exit', (code) => {
  if (code === 0) uploadSourceMaps();
  process.exit(code ?? 1);
});

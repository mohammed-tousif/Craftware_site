// One-time (or password-change) setup for the CraftWare admin.
//
//   node scripts/setup-admin.mjs
//
// Asks for the shared admin password (typed hidden, never printed or saved
// in plain text), then stores ONLY its scrypt hash plus a random session
// secret as Vercel environment variables for Production and Preview, using
// your logged-in Vercel CLI. Changing the password later: run it again,
// then redeploy (existing sessions are signed out because the secret
// rotates too).
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import readline from 'node:readline';
import { hashPassword } from '../lib/auth.js';

function askHidden(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = (s) => { if (s.includes(prompt)) rl.output.write(prompt); else rl.output.write('*'); };
    rl.question(prompt, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
  });
}

function setEnv(name, value, target) {
  spawnSync('vercel', ['env', 'rm', name, target, '--yes'], { stdio: 'ignore', shell: true });
  const r = spawnSync('vercel', ['env', 'add', name, target], { input: value, stdio: ['pipe', 'inherit', 'inherit'], shell: true });
  if (r.status !== 0) throw new Error(`vercel env add ${name} ${target} failed`);
}

const pw = await askHidden('New admin password (min 12 characters): ');
if (pw.length < 12) { console.error('Too short — use at least 12 characters.'); process.exit(1); }
const again = await askHidden('Repeat the password: ');
if (pw !== again) { console.error('The two passwords did not match. Nothing was changed.'); process.exit(1); }

const hash = hashPassword(pw);
const secret = crypto.randomBytes(48).toString('base64url');
for (const target of ['production', 'preview']) {
  setEnv('ADMIN_PASSWORD_HASH', hash, target);
  setEnv('SESSION_SECRET', secret, target);
}
console.log('\nDone. ADMIN_PASSWORD_HASH and SESSION_SECRET are set on Vercel (production + preview).');
console.log('Redeploy (or click Publish in the admin) for the change to take effect.');

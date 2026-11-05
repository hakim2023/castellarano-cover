// Change the admin password: node scripts/set-password.mjs "new password"
// Writes only a scrypt hash to .env (local) and prints the ADMIN_HASH line to paste into your host's environment variables.
import fs from 'node:fs';
import crypto from 'node:crypto';
const pw = process.argv[2] || '';
if (pw.length < 10) { console.error('Use at least 10 characters.'); process.exit(1); }
const salt = crypto.randomBytes(16);
const hash = `${salt.toString('hex')}:${crypto.scryptSync(pw, salt, 64).toString('hex')}`;
if (fs.existsSync('.env')) {
  const env = fs.readFileSync('.env', 'utf8');
  fs.writeFileSync('.env', /^ADMIN_HASH=.*$/m.test(env) ? env.replace(/^ADMIN_HASH=.*$/m, `ADMIN_HASH=${hash}`) : env + `ADMIN_HASH=${hash}\n`, { mode: 0o600 });
  console.log('Local .env updated. Restart the server (npm start).');
}
console.log(`\nFor your host's environment variables:\nADMIN_HASH=${hash}`);

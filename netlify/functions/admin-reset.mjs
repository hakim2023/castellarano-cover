// Forgot / change password: emails a one-time link to the admin address and sets the new password.
// Rate-limited by Netlify; the handler also waits 2 minutes between emails.
import { handleReset } from '../lib/core.mjs';

export default (req, context) => handleReset(req, context);

export const config = {
  path: '/api/admin-reset',
  method: 'POST',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

// Admin password check. Netlify rate-limits it per visitor to stop password guessing.
import { handleLogin } from '../lib/core.mjs';

export default (req) => handleLogin(req);

export const config = {
  path: '/api/admin-login',
  method: 'POST',
  rateLimit: { windowLimit: 5, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

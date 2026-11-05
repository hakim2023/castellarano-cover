// Public review form. Netlify rate-limits it per visitor to stop spam floods.
import { handleReview } from '../lib/core.mjs';

export default (req) => handleReview(req);

export const config = {
  path: '/review',
  method: 'POST',
  rateLimit: { windowLimit: 3, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

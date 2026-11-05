// Pages, uploaded photos and the secret admin page. Static files in public/ win (preferStatic).
import { handleSite } from '../lib/core.mjs';

export default (req, context) => handleSite(req, context);

export const config = { path: '/*', excludedPath: ['/review', '/api/*'], preferStatic: true };

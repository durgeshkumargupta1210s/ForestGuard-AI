/**
 * Filesystem locations for generated artifacts.
 *
 * Resolved from this file's own location rather than from process.cwd(), so
 * the static mounts in app.js and the PDF writer in report.service.js agree
 * no matter which directory the server was started from.
 */

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(
  fileURLToPath(import.meta.url)
);

// backend/src/config -> backend
export const BACKEND_ROOT = path.resolve(
  __dirname,
  "..",
  ".."
);

export const REPORTS_DIR = path.join(
  BACKEND_ROOT,
  "reports"
);

export const UPLOADS_DIR = path.join(
  BACKEND_ROOT,
  "uploads"
);

# Latest validation — 1 November 2026

Application source 966a19bf474e82d09be4fc1ebc04dc6ddb4746ce was checked locally with synthetic data:

- npm test: 179 passed, zero failures, zero skips, dedicated local PostgreSQL test database.
- npm run build: passed, including TypeScript checks; existing >500 kB scene warning remains.
- npm run smoke:intake: 5/5 passed with simulated channels and no external messages.

The later evaluation/template update changes documentation and saved diagnostic results only. These application checks were not rerun for that documentation-only update. No Replit deployment or real channel verification was performed by either publishing operation. Evaluation accuracy is documented separately in src/evaluation/compare-vlm/README.md; tests passing do not establish real bank reconciliation or merchant time savings.

# Source validation history

Checked on 24 October 2026, Windows, Node.js 24, local PostgreSQL and installed Chrome. This source snapshot includes the V4 interface, Owner demo reset, 180-second receipt-worker lease, English Telegram acknowledgements and the reset regression test.

- npm run verify:local from src/: PASS (final run 2026-10-24T13:37:27.679Z).
- Build and TypeScript checks: PASS. The separately loaded 3D scene retains the existing Vite warning above 500 kB.
- Integration tests: 128 passed, zero failures and zero skips.
- Local CPU deployment/startup/restart checks: PASS.
- Browser business checks: 11 passed, including confirmation, separate release, Owner approval, blocked evidence, session isolation and OCR provenance.
- npm run smoke:intake: 5/5 PASS, simulated channels only; no external messages.

An earlier run passed each functional check but failed its final source-integrity guard because a receipt README was edited during verification. The final run used stable files and passed the guard. This was not silently counted as a successful first run.

Root Replit commands enter src/ before installation, build and startup. This GitHub update was not redeployed to Replit; exact parity with the currently deployed source was not independently established. Prior V4 visual checks are historical, documented in src/submission/VALIDATION.md. Physical devices, fresh Linux deployment and real channel replay behavior were not retested in this update.

The RunPod proof-of-use PDF has been assembled from five original screenshots and visually checked. The Replit proof-of-use PDF has also been assembled from four original screenshots and visually checked. The team subsequently uploaded its proposal, technical declaration and slide deck; their links are now included in the root README. The Phase 1 pitch video link was subsequently supplied in the root README; current public access was not rechecked. Public visibility and designated collaborator access are separate submission requirements; collaborator access has not been verified here.

# Acceptance tests

One Playwright test per spec requirement, written by the build agent before any feature code.
Files end in `.spec.ts`. The `acceptance_tests` gate fails when this folder has no tests.

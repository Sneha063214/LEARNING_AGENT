# Security Policy & OWASP Guardrails — LearnPath AI

## 1. Prompt Injection & LLM Guardrails
- **4-Layer Input Sanitization (`AIService.sanitize_user_input`)**: All student inputs to the Socratic AI Tutor and Assessment generators are validated for length limits, stripped of non-printable control characters, filtered against regex jailbreak directives (`ignore previous instructions`, `system prompt`, `DAN`), and HTML-escaped against reflected/stored XSS.

## 2. Application & API Security Controls
- **OWASP HTTP Security Headers**: Every response enforces `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
- **Sliding-Window Rate Limiting**: Protects API endpoints from brute-force and token-exhaustion DoS attacks (`120 req/min` per IP).
- **Parameterized SQL Queries**: All SQLite database operations use prepared `?` placeholders with `PRAGMA foreign_keys = ON`.
- **Cryptographic Password & Key Management**: Passwords use Werkzeug PBKDF2-SHA256 salting/hashing, and runtime secrets default to `secrets.token_hex(32)` if unset in `.env`.
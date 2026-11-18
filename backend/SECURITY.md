# Security Policy & Architecture — LearnPath AI

## 1. Authentication & Cryptographic Session Integrity
- Passwords are salted and hashed using Werkzeug PBKDF2-SHA256 (`generate_password_hash`).
- Session tokens are cryptographically signed using HMAC-SHA256 (`itsdangerous.URLSafeTimedSerializer`) with expiration enforcement.

## 2. Prompt Injection & Input Sanitization Guardrails
- All student inputs to the AI Tutor and Assessment endpoints are sanitized against prompt injection directives (e.g., system prompt overrides, instruction hijacking) and HTML/XSS payloads.
- SQL queries strictly enforce parameterized prepared statements (`?` placeholders) with SQLite foreign key constraints enabled.

## 3. HTTP Security Headers & Rate Limiting
- All API responses enforce `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Content-Security-Policy`.
- In-memory sliding-window rate limiting protects authentication and LLM generation endpoints from abuse.
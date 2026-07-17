# Radhika Jewellers - Enterprise Security Architecture & Policies

This document describes the security policies, architecture patterns, and defense configurations implemented on the Radhika Jewellers luxury eCommerce platform.

---

## 1. HTTP Security Headers (OWASP Security)
We enforce headers at the edge (in Next.js middleware) to protect users:
* **Content-Security-Policy**: Enforces script/frame source white-lists, blocking unauthorized third-party scripts.
* **Strict-Transport-Security**: Enforces `max-age=63072000; includeSubDomains; preload` to guarantee HTTPS.
* **X-Frame-Options**: Set to `DENY` to prevent clickjacking.
* **X-Content-Type-Options**: Set to `nosniff` to protect against MIME sniffing.
* **Referrer-Policy**: Set to `strict-origin-when-cross-origin` to prevent data leakage in URL references.
* **Permissions-Policy**: Restricts access to client hardware APIs (camera, microphone, geolocation).
* **Cross-Origin-Opener-Policy (COOP)**: Set to `same-origin`.
* **Cross-Origin-Resource-Policy (CORP)**: Set to `same-origin`.

---

## 2. Secure Cookies & Authentication
All Auth.js session cookies are locked down:
* **Secure**: Only transmitted over encrypted (HTTPS) connections.
* **HttpOnly**: Inaccessible to JavaScript, preventing session stealing via XSS.
* **SameSite=Lax**: Restricts cross-site session transfers while maintaining usability.

---

## 3. Account Lockout & Session Security
* **Brute-Force Lockout**: Automatically tracks failed login attempts inside the database. After **5 failed attempts**, the account is locked for **15 minutes** using the `lockUntil` timestamp.
* **Stateless JWT Checks**: Verification calls check the user status in database query lookups.

---

## 4. Password Security
* **Strong Hashing**: Passwords are encrypted using `bcryptjs` with a cost factor of **12** (salt rounds). Plaintext passwords are never stored.
* **Complexity Validation**: User signups are validated using Zod, requiring:
  * Minimum 8 characters.
  * At least 1 uppercase letter.
  * At least 1 lowercase letter.
  * At least 1 number.
  * At least 1 special character.

---

## 5. Role Based Access Control (RBAC)
* **Roles**: Enforced roles are `user` (Customer) and `admin`.
* **Verification**: Admin path routes (`/admin`, `/api/admin/*`) are protected in `middleware.ts` and require authenticated users to have `role === 'admin'`.

---

## 6. NoSQL Injection Prevention
* **Query Parameterization**: Parameters are checked and passed through sanitizers.
* **Input Sanitization**: We created `sanitizeObject` and `sanitizeString` to filter out characters and Mongoose query operators (prefixing with `$` or containing `.`).

---

## 7. CSRF Protection
* NextAuth implements double-submit CSRF cookies for all credentials sign-in/out post calls. State-changing requests are protected via token validations.

---

## 8. Rate Limiting
* Route-specific rate limits are enforced in `middleware.ts`:
  * **Auth routes**: Max 5 requests per minute.
  * **Checkout & returns**: Max 10 requests per minute.
  * **Other APIs**: Max 60 requests per minute.

---

## 9. API Security & Error Handling
* Stack traces and internal database errors are hidden from client responses. Production errors return generic codes. 
* All inputs are verified against schema models before processing.

---

## 10. Payment & Integration Verification
* **Razorpay**: Verification checks the order state before applying payment credits, preventing replay verification attacks.
* **Shiprocket**: Incoming status webhooks are authenticated by validating authorization headers against `process.env.SHIPROCKET_WEBHOOK_TOKEN` to prevent fake shipment delivery injections.

---

## 11. Security Audit Trail
* Administrative changes are registered in the `AuditLog` collection through `AuditService.logAction`. Credentials, passwords, and tokens are automatically masked before logging.

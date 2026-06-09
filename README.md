# ARGUS: Academic Registry for Gadgets in a Unified System
ARGUS is a centralized monitoring system built to replace manual logbook-based workflows for tracking laptops in ICT laboratory environments. It was implemented as a research project for Senior Highschool and is on track for continued use in its ICT Lab.  The system is built on a Node.js/Express backend, a Python client, and an SQLite database.
- **QR-Based Authentication** — Students log in by scanning a personally issued QR identifier through the laptop's camera. Each identifier is cryptographically signed with HMAC-SHA256, preventing forgery or tampering. New identifiers can be generated and issued directly from the admin dashboard.
- **Laptop Status Monitoring** — Each enrolled laptop reports its battery level, current user, section, and active session duration back to the central server in real time.
- **Admin Dashboard** — Provides a centralized view of all connected laptops, including a usage graph, a filtered list of low-battery devices, and a searchable history across  device records.

This project is in active and continuous development.

# Security Policy

Sayzy is an accessibility tool used by nonverbal and speech-impaired users, some of whom may store personal information (saved phrases, family voice recordings, task/shopping lists) locally within the app. Because of this, we take security reports seriously and appreciate responsible disclosure from the community.

## Supported Versions

Sayzy is currently in active development and has not yet reached a stable 1.0 release. Security fixes are applied to the latest version on the `main` branch.

| Version        | Supported          |
| -------------- | ------------------ |
| 0.1.x (current, pre-release) | ✅ Yes |
| < 0.1.0        | ❌ No               |

> This table will be updated as Sayzy moves toward a stable 1.0 release and formal version tags are introduced.

## Reporting a Vulnerability

If you discover a security vulnerability in Sayzy, please **do not open a public GitHub issue**. Instead, report it privately so it can be fixed before it's publicly disclosed.

**How to report:**
- Open a [GitHub Security Advisory](https://github.com/pranavrathod07/Sayzy/security/advisories/new) (preferred), or
- Email: [your-contact-email-here]

Please include as much of the following as you can:
- A clear description of the vulnerability and its potential impact
- Steps to reproduce it (proof-of-concept code, if applicable)
- The version/commit of Sayzy you tested against
- Any suggested fix, if you have one

## What to Expect

- **Acknowledgement:** within 3–5 days of your report
- **Initial assessment:** within 7 days, including whether the report is accepted, needs more information, or is declined
- **Fix & disclosure:** once a fix is ready, it will be released and the reporter credited (if desired) in the release notes, unless anonymity is requested

## Scope

This policy covers the Sayzy application and its official codebase in this repository. It does **not** cover:
- Third-party dependencies (please report those directly to the respective maintainers)
- Issues arising from modified or unofficial forks of Sayzy
- Social engineering or physical access attacks

## Data Handling Note

Sayzy is designed to work fully offline and store user data (custom shortcuts, voice recordings, history logs) locally on-device wherever possible. If you find a case where sensitive data is being transmitted, logged, or stored in an unexpected or insecure way, please treat it as a security report under this policy.

## Acknowledgements

We're grateful to anyone who takes the time to responsibly disclose a vulnerability — it directly helps protect a community of users who depend on this app to communicate.

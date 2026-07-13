<div align="center">

# 🗣️ Sayzy

### One line. One voice.

*A free, open-source AAC app that turns a drawing, a letter, or a single tap into instant speech.*

[![License](https://img.shields.io/badge/license-MIT-DC6B48?style=flat-square)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-DC6B48?style=flat-square)](#contributing)
[![Built with TypeScript](https://img.shields.io/badge/built%20with-TypeScript-3178C6?style=flat-square)](#tech-stack)
[![Offline First](https://img.shields.io/badge/offline-first-B94E30?style=flat-square)](#features)

🌐 **Website:** [https://sayzy.netlify.app/] &nbsp;·&nbsp; 📱 **Download:** [https://sayzy.netlify.app/]

</div>

---

## Why Sayzy exists

For someone who can't speak, the gap between *thinking* something and *saying* it is usually filled with menus, symbol grids, and taps through categories. Sayzy closes that gap: draw a quick shape, tap a saved shortcut, or type a sentence, and it's spoken out loud — instantly, offline, no hunting required.

Every feature lives behind one clean drawing screen. Nothing shows up until you need it. That's the whole philosophy.

## Features

| | |
|---|---|
| ⚡ **Instant draw-to-speech** | Draw a symbol or letter, hear it spoken back immediately |
| ✍️ **Handwriting recognition** | Understands rough, imperfect drawings — not just perfect shapes |
| 🔒 **Custom shortcuts** | Lock any drawing to any phrase, permanently, until you change it |
| 🔤 **Multi-letter codes** | Shorthand like `KH` → *"Kaise ho"*, saved once, remembered forever |
| ⌨️ **Type-to-speech** | Type anything, hear it instantly |
| 💬 **Live captions** | See exactly what's being spoken, in real time |
| 🕓 **Speech history** | A timestamped log of everything said |
| 👪 **Family voice recording** | Hear saved phrases in a loved one's real voice, not a robot |
| 🛒 **Shopping & task lists** | Build a list at home, play it aloud item by item at the store |
| 📴 **Fully offline** | No internet required for any core feature |
| ✋ **Built for every hand** | Large touch targets and haptic feedback throughout |
| 🌍 **Free & open source** | Built in the open, forever — no ads, no login wall |

## Tech stack

- **Monorepo:** pnpm workspaces
- **Runtime:** Node.js 24 · TypeScript 5.9
- **API:** Express 5
- **Database:** PostgreSQL + Drizzle ORM
- **Validation:** Zod (`zod/v4`), `drizzle-zod`
- **API codegen:** Orval — generates typed hooks and Zod schemas straight from the OpenAPI spec
- **Build:** esbuild (CJS bundle)

## Getting started

### Prerequisites
- Node.js 24
- pnpm
- A PostgreSQL database (connection string for `DATABASE_URL`)

### Setup

```bash
# clone the repo
git clone https://github.com/pranavrathod07/Sayzy.git
cd Sayzy

# install dependencies
pnpm install

# create a .env file in the project root with:
# DATABASE_URL=your_postgres_connection_string
```

### Run & operate

```bash
# run the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# typecheck across all packages
pnpm run typecheck

# typecheck + build all packages
pnpm run build

# regenerate API hooks and Zod schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# push DB schema changes (development only)
pnpm --filter @workspace/db run push
```

## Project structure

```
Sayzy/
├── artifacts/
│   ├── api-server/   # backend service
│   └── mobile/       # the Sayzy app — drawing canvas, TTS, shortcuts, lists
├── lib/
│   ├── api-client-react/  # generated React hooks
│   ├── api-spec/          # OpenAPI spec + codegen config
│   └── db/                # Drizzle schema + DB access
└── scripts/           # build/utility scripts
```

## Roadmap

- [ ] Multi-language voice support
- [ ] Community-contributed shortcut packs
- [ ] Wear OS / companion device support
- [ ] Improved offline handwriting model

## Contributing

Contributions are welcome and genuinely appreciated — this is a project built for a community that's often overlooked by mainstream software. Found a bug? Have an idea? Open an issue. Want to fix something? Open a pull request. For larger changes, please open an issue first so we can talk it through.

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Built for the nonverbal and speech-impaired community, with one goal: make everyday communication faster, simpler, and more personal.

---

<div align="center">
<sub>If Sayzy helped you or someone you know, consider starring ⭐ the repo — it helps more people find it.</sub>
</div>

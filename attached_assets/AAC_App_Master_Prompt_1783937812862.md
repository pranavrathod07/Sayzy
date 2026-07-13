## PROMPT START

Build a mobile-first, ultra-lightweight, ultra-fast **Augmentative and Alternative Communication (AAC) app** for nonverbal/speech-impaired users. The core philosophy is: **speed and simplicity above everything else.** Every design decision should minimize taps, minimize load time, and minimize visual clutter. This app helps someone who cannot speak communicate instantly by drawing a symbol/gesture, typing, or tapping a saved shortcut — and the phone speaks it out loud immediately.

### 1. CORE SCREEN / MAIN LAYOUT 

- The main screen is **90% a blank drawing canvas** — nothing else, no clutter.
- A **thin vertical sidebar** (like a slim pencil-width rail, similar to a collapsed navigation drawer) sits on one edge of the screen, showing only small icons (no text labels) for:
  - Task/Shopping List
  - Customize (manage saved shortcuts/words)
  - History/Caption Log
  - Family Voice Recording
  - Settings
- Tapping a sidebar icon opens that feature as a slide-in panel or bottom sheet, then returns to the drawing canvas when closed. The sidebar itself should be nearly invisible/minimal until interacted with.
- No other buttons should be visible on the main screen by default.

### 2. CONTEXTUAL / PROGRESSIVE UI (Very Important)

- Buttons should only appear when they are contextually needed — not before, not after. Examples:
  - A **large "STOP" button** appears ONLY while speech/audio is actively playing. It should animate in (fade + scale) at the bottom-center of the screen, large enough for easy thumb tap, and animate out the instant speech ends.
  - A **"NEXT" button** appears briefly after a phrase finishes speaking, allowing the user to immediately move to the next input, then fades away if unused.
  - No permanent toolbars, no persistent bottom nav bars — everything is need-based and disappears when not needed.

### 3. GESTURE-TO-SPEECH ENGINE

- Implement a **zone-based + shape-recognition hybrid system**:
  - The canvas is divided into invisible touch zones/areas that can be assigned fixed meanings for instant, 100%-reliable recognition (no AI delay).
  - Additionally, integrate on-device handwriting/shape recognition (e.g. Google ML Kit Digital Ink Recognition or equivalent offline library) so that imperfect/messy drawings of letters or simple symbols are still matched to the closest saved meaning.
  - Recognition must be near-instant (target under 300ms) with no visible "processing" spinner if possible.

### 4. CUSTOMIZATION SYSTEM (Core Differentiator)

- Users can **create their own gesture-to-phrase mappings**:
  - Draw or select a symbol/letter, then type or record the phrase it should trigger.
  - Once saved, that mapping is "locked" — even a rough/imperfect version of that same drawing should still trigger the correct saved phrase (tolerant matching, not exact-shape matching).
  - Full **Edit** and **Delete** controls for every saved shortcut, accessible via the Customize panel.
- Support **multi-letter shortcut codes** (like text-message shorthand), e.g.:
  - "KH" → "Kaise ho"
  - "KK" → "Khana khaya"
  - "MPH" → "Mujhe pasand hai"
  - These should be enterable via a simple type-in field on top of the drawing option.
- Support assigning **multiple phrases to one symbol**, letting the user pick which one they meant from a small popup (e.g., drawing "K" shows a quick choice between 2-3 saved options).
- All customization data is stored **locally on-device** (no login required, no cloud dependency for core function).

### 5. TYPE-TO-SPEECH MODE

- A simple text input field option (accessible from the sidebar or a small toggle) where the user can type any sentence and have it spoken instantly via Text-to-Speech (TTS).
- Should support predictive text/autosuggest based on previously used phrases.

### 6. LIVE CAPTION / SUBTITLE DISPLAY

- Every time the app speaks anything, the exact text being spoken must appear on-screen in real time as large, readable captions (like subtitles), so the user can visually confirm what was said.
- Caption should clearly indicate if it came from a drawing, shortcut code, typed text, or list.

### 7. HISTORY / SPEECH LOG

- Maintain a chronological log of everything the app has spoken, each entry timestamped (e.g., "10:30 AM — Khana khaya").
- Accessible via the sidebar as a scrollable list. Should be simple, lightweight, stored locally.

### 8. FAMILY / CAREGIVER VOICE RECORDING

- Allow a family member or caregiver to record their own real voice (short 2-3 second clips) and assign that recording to a specific saved shortcut/phrase, replacing the robotic TTS voice for that entry.
- Recordings stored locally, playback instant.

### 9. TASK / SHOPPING LIST MODE

- A dedicated lightweight list-making tool (like a minimal notes/todo app) where the user can pre-build a list at home, e.g.:
  1. Aalu 1kg
  2. Bhindi 20rs ki
  3. Gajar 1kg
- A single button plays through the entire list **sequentially via TTS**, with a short pause or a manual "next item" tap between each item, so a shopkeeper can clearly understand one item at a time.
- Include a "repeat this item" button in case the listener didn't hear clearly.
- Support saving reusable list templates (e.g., "Weekly Grocery," "Medicine List").

### 10. FEEDBACK & ACCESSIBILITY

- Add subtle **haptic vibration feedback** on every successful gesture recognition or button tap, so users get confirmation without needing to look at the screen.
- Support **large touch targets** throughout (minimum 48x48dp) for users with motor impairments.
- Include a **high-contrast / dark mode** toggle in settings.
- Ensure compatibility with screen readers (TalkBack/VoiceOver) for users who may also have visual impairments.
- All core features must work **fully offline** — no internet dependency for speech, drawing recognition, or saved data.

### 11. VISUAL DESIGN — "GOOGLE-STYLE SHINE" ON BUTTONS

This is a specific visual polish requirement — apply it to every interactive button/icon in the app:

- Implement the **Material Design "state layer" and ripple/shine effect**: when a button is tapped, a soft radiating light/ripple animation should emanate from the touch point across the button surface, fading smoothly (this is the standard Android/Google ripple effect — use it, or replicate it with a subtle radial gradient animation on tap for non-native frameworks).
- On buttons that are especially important (like STOP, or a "speak" trigger), add a **subtle animated glossy sheen** — a soft diagonal light streak that gently sweeps across the button surface on appearance or on idle loop (similar to a shimmer/skeleton-loading light sweep effect, but more refined and subtle, not distracting).
- Buttons should have soft elevation/shadow (Material Design elevation levels) to feel tactile and "pressable," with a slight scale-down animation (press state) when tapped.
- Overall design language: clean, rounded corners, soft shadows, calming color palette (avoid harsh clinical white — use warm neutral tones), smooth 150-250ms transitions on all UI state changes.
- Icons should be simple, universally recognizable (Material Icons style or similar), no text clutter on the main screen.

### 12. PERFORMANCE REQUIREMENTS

- App must launch in under 2 seconds on mid-range/low-end Android devices.
- No unnecessary background processes; pause any recognition/ML processing when app is backgrounded to save battery.
- Keep total app size minimal — avoid heavy unused libraries or assets.
- Prioritize smooth 60fps animations especially for the contextual button appear/disappear transitions and the button shine effects.

### 13. TECHNICAL PREFERENCES (if the builder asks)

- Cross-platform framework preferred (e.g., Flutter or React Native) for single-codebase Android + iOS support.
- Local storage only (e.g., SQLite/Hive or equivalent) — no backend/server required for MVP.
- Built-in device Text-to-Speech engine for voice output (support multiple languages including Hindi and English).
- On-device ML for handwriting/gesture recognition (offline-capable).

### 14. PRIORITY ORDER FOR MVP (if building in phases)

1. Drawing canvas + zone-based instant speech + STOP/NEXT contextual buttons + Google-style shine on buttons
2. Customize panel (add/edit/delete shortcuts, multi-letter codes, type-to-speech)
3. Live captions + history log
4. Task/Shopping list mode
5. Family voice recording
6. Dark mode, accessibility polish, animations refinement

## PROMPT END
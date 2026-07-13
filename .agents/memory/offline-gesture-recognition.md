---
name: Offline gesture matching without ML Kit
description: How to do tolerant, fully-offline hand-drawn shape matching in an Expo Go app when native ML handwriting libraries aren't available.
---

Expo Go can't load native ML modules (e.g. ML Kit digital-ink recognition), so "match this rough hand-drawn symbol to a saved template, offline, near-instantly" can't use a native ML library in that environment.

**Why:** Expo Go ships a fixed native binary; anything requiring a custom native module needs a dev client / EAS build, which is heavier than most AAC/drawing-matching features justify for an MVP.

**How to apply:** Implement the classic "$1 Unistroke Recognizer" (Wobbrock et al.) purely in JS: resample the stroke to N points, rotate to indicative angle, scale to a reference square, translate to centroid, then compare against saved templates using golden-section-search rotation-invariant path distance. Multi-stroke drawings can be flattened (concatenate strokes in draw order) and treated as one unistroke for matching purposes. This gives sub-300ms, tolerant, fully offline matching with no native dependency — good enough for AAC-style symbol-to-phrase mapping. Store templates as normalized point arrays (already resampled/rotated/scaled) in local storage so matching at recognition time only needs the rotation search step.

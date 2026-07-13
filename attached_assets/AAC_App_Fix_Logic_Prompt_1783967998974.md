## PROMPT START

The visual design (UI/UX) of this app is already complete and should NOT be redesigned or restyled. Your job now is ONLY to implement the actual working functionality/logic behind every screen and button so the app truly works end-to-end. Go feature by feature, and after implementing each one, verify it actually works before moving to the next. Do not skip any step below.

### ISSUE 1 — Drawing on the home screen is not working at all

- The home screen must have a functional touch-based drawing canvas that captures the user's finger/stylus movement in real time and renders the stroke visually as they draw (like a whiteboard).
- Use the appropriate native drawing/canvas approach for this framework (e.g., a `GestureDetector` + `CustomPainter` in Flutter, or an HTML5 `<canvas>` with pointer/touch event listeners if this is a web-based app, or the platform's native drawing view).
- Make sure:
  - Touch-start begins a new stroke.
  - Touch-move continuously draws the line following the finger.
  - Touch-end finalizes the stroke and immediately triggers the recognition/matching logic (see Issue 2).
  - The canvas visually clears automatically after each recognized gesture, ready for the next input.
- Test explicitly: draw a simple shape or letter on the home screen and confirm the stroke appears on screen live as you draw, not just after lifting your finger.

### ISSUE 2 — Gesture/drawing recognition is not connected to any output

- After a stroke is completed on the canvas, the app must:
  1. Check if the drawn shape/letter matches any saved shortcut in local storage (start with simple shape/letter matching, not advanced AI, to guarantee reliability).
  2. If a match is found, immediately trigger Text-to-Speech to speak the associated saved phrase out loud.
  3. If no match is found, show a small non-blocking message like "No match found — tap Customize to save this" instead of doing nothing silently.
- Implement this matching using a simple local lookup: store each shortcut as a record like `{ trigger_shape_id, trigger_letters, phrase_text, voice_clip_path }` in local storage (SQLite/Hive/localStorage — whichever this framework uses), and check against it every time a stroke is completed.
- Test explicitly: create one test shortcut manually in the database (e.g., map letter "K" to phrase "Test working"), draw it, and confirm the phrase is spoken aloud.

### ISSUE 3 — Text-to-Speech (TTS) is not actually producing sound

- Integrate the platform's native TTS engine (e.g., Web Speech API's `SpeechSynthesis` if this is a web app, or `flutter_tts` if Flutter, or native `TextToSpeech` API if native Android/iOS).
- Confirm TTS actually produces audible sound on: (a) a recognized drawing, (b) typed text-to-speech input, (c) tapping any saved shortcut button.
- Handle the case where TTS is not yet loaded/ready on app start — preload it in the background when the app launches so there's no delay on first use.

### ISSUE 4 — STOP button does nothing / doesn't appear correctly

- The STOP button must:
  1. Only become visible on screen at the exact moment TTS/audio starts playing.
  2. When tapped, immediately halt the TTS playback (use the platform's stop/cancel method for the TTS engine, not just hide the button).
  3. Automatically hide itself again the moment speech finishes naturally or is stopped.
- Test explicitly: trigger a phrase to be spoken, tap STOP mid-sentence, and confirm the audio actually cuts off immediately (not just the button disappearing while audio keeps playing).

### ISSUE 5 — NEXT button does nothing

- The NEXT button must clear/reset the current canvas or input state and prepare the app to immediately accept a new gesture, typed input, or shortcut tap — with no leftover state from the previous interaction.
- It should appear briefly after speech finishes, then auto-hide if not tapped within a couple of seconds.

### ISSUE 6 — Sidebar icons are not functional / do not open their panels

- Each sidebar icon must open its correct corresponding screen/panel when tapped:
  - Task/Shopping List icon → opens the list-building screen (see Issue 9)
  - Customize icon → opens the shortcut management screen (see Issue 7)
  - History icon → opens the speech log screen (see Issue 8)
  - Family Voice Recording icon → opens the voice recording screen (see Issue 10)
  - Settings icon → opens app settings
- Each panel must have a clear, working close/back action that returns the user to the home drawing screen without restarting the app.
- Test explicitly: tap every single sidebar icon one by one and confirm each opens its correct screen, and each screen's back button correctly returns home.

### ISSUE 7 — Customize screen: Add/Edit/Delete are not saving or working

- Implement full CRUD (Create, Read, Update, Delete) functionality connected to local storage:
  - **Add**: user draws or selects a gesture/letter combination, types the phrase it should trigger, and taps Save. This must actually write a new record to local storage, and it must immediately become usable for recognition (Issue 2) without needing to restart the app.
  - **Edit**: user taps an existing saved shortcut, changes the phrase or gesture, taps Save, and the local storage record is updated (not duplicated).
  - **Delete**: user taps delete on a shortcut (with a confirmation prompt: "Delete this shortcut?"), and it is permanently removed from local storage and can no longer be triggered.
  - **Multi-letter codes**: user must be able to type a 2-3 letter code (e.g., "KH") into a text field, assign it a phrase, and save it the same way as drawn shortcuts. When those exact letters are typed or drawn elsewhere in the app, it must trigger the correct phrase.
- Test explicitly: add a new shortcut, close the app fully, reopen it, and confirm the shortcut still exists and works. Then edit it, then delete it, confirming each step visibly changes behavior.

### ISSUE 8 — History/Caption log is empty or not updating

- Every single time the app speaks any phrase (from drawing, typed text, shortcut tap, or list item), automatically create a new entry in the local history log with the exact text spoken and the current timestamp.
- The History screen must read from this same local storage and display entries in reverse chronological order (most recent first), and it must update live/refresh each time you return to that screen.
- Also implement the live on-screen caption: the exact text being spoken must appear as large on-screen text at the moment speech starts, and clear or fade when speech ends.
- Test explicitly: speak three different phrases, then open the History screen and confirm all three appear with correct timestamps in the right order.

### ISSUE 9 — Task/Shopping List is not functional

- Implement a working list builder:
  - User can add new line items (text input + "add item" button), each saved to local storage under a named list.
  - User can delete individual items and reorder them if needed.
  - A "Play List" button must read out each item one by one via TTS in sequence, with either an automatic short pause between items or a manual "next item" tap to advance.
  - A "repeat" button re-speaks the current item without advancing.
  - Support saving multiple named lists (templates) and switching between them.
- Test explicitly: create a 3-item list, tap "Play List," and confirm all three items are spoken in order, correctly, one at a time.

### ISSUE 10 — Family Voice Recording is not functional

- Implement actual audio recording using the platform's microphone/audio recording API.
- User taps record, speaks a short phrase, taps stop, and the audio clip is saved locally and linked to a specific shortcut.
- When that shortcut is triggered afterward, play back the recorded audio clip instead of (or as an option instead of) the TTS voice.
- Test explicitly: record a short clip, assign it to a shortcut, trigger that shortcut, and confirm the actual recorded voice plays (not the robotic TTS).

### ISSUE 11 — Haptic feedback is missing

- Add a short vibration trigger (using the platform's vibration/haptics API) on: successful gesture recognition, any button tap, and shortcut save/delete confirmation.

### ISSUE 12 — General reliability requirement

- After implementing each feature above, explicitly test it end-to-end yourself before reporting it as done. Do not mark anything as complete if tapping the button produces no visible or audible change.
- If any feature cannot be fully implemented due to platform limitations, clearly state which one and why, instead of silently leaving it non-functional.

## PROMPT END

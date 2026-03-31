# Radio Lingo

Amateur radio license study app for iOS and Android. Covers Technician, General, and Extra license pools.

## Tech Stack

- **Expo SDK 55**, React Native 0.83.2, React 19.2.0
- **Expo Router** (file-based routing, typed routes enabled)
- **Tamagui** (UI primitives: `YStack`, `XStack`, etc.) + `@radio-lingo/ui` shared components
- **Supabase** for auth and exam persistence
- **Yarn 4** workspaces monorepo

## Project Structure

```
apps/mobile/          — Expo app
  app/
    (tabs)/           — Tab bar: Home, Study, Exam, Progress
    auth.tsx          — Auth screen
    exam/
      start.tsx       — Exam setup, creates Supabase records
      [examId].tsx    — Active exam (question-by-question)
      results/        — Exam results
    review/[pool]/    — Flashcard review mode
      index.tsx       — Group/subelement picker
      session.tsx     — Review session
  lib/
    questions.ts      — Question data, pool helpers, exam builder
    supabase.js       — Supabase client
  assets/images/data/ — Question JSON (technician, general, extra)
  plugins/
    withFullScreenSplash.js  — Custom splash config plugin

packages/ui/src/      — Shared component library
  theme.ts            — Color tokens
  Typography.tsx      — ScreenTitle, Subtitle, SectionLabel
  RoundedButton.tsx   — Primary / outline button
  StyledInput.tsx     — Text input
  tamagui.config.ts   — Tamagui theme config
```

## Running the App

```bash
# Dev (after first native build)
yarn mobile:tunnel              # Terminal 1: start Metro with tunnel
# open Radio Lingo on phone

# Full native rebuild (needed after native config changes)
yarn mobile:rebuild             # prebuild → fix-splash → run:ios --device
```

> Expo Go does NOT work — must use a development build.

## Splash Screen (Critical)

`expo-splash-screen` ignores `resizeMode: "cover"` and always generates a 100×100 centered storyboard. `prebuild --clean` overwrites any manual fix.

**Working approach** (`yarn mobile:rebuild` does this automatically):
1. `yarn mobile:prebuild` — generates ios/
2. `yarn mobile:fix-splash` — overwrites `SplashScreen.storyboard` with full-bleed version
3. `yarn mobile:ios` — builds WITHOUT `prebuild --clean`

See [splash-screen-fix.md](apps/mobile/splash-screen-fix.md) for storyboard content.

## Question Data Model

```ts
interface Question {
  id: string;          // e.g. "T1A01"
  pool: PoolId;        // 'technician' | 'general' | 'extra'
  subelement: string;  // "T1"
  group: string;       // "T1A"
  question: string;
  answers: string[];   // always 4
  correct: number;     // 0-based index
  refs: string;
}
```

Question pools: `technician-2022-2026`, `general-2023-2027`, `extra-2024-2028`.

Practice exams: one random question per group, answers shuffled.

## Supabase Tables

- `practice_exams` — `{ id, user_id, pool_id, total, created_at }`
- `practice_exam_questions` — `{ exam_id, question_id, answer_order[] }`

Auth uses `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` env vars.

## Shared UI Components (`@radio-lingo/ui`)

Import from `@radio-lingo/ui`:

| Component | Usage |
|-----------|-------|
| `ScreenTitle` | Page heading (28px, 800 weight) |
| `Subtitle` | Secondary text under title |
| `SectionLabel` | Uppercase section header |
| `RoundedButton` | `title`, `onPress`, `outline?`, `disabled?` |
| `StyledInput` | Styled text input |
| `colors` | Color token object |

## UI Style Guide

### Colors
- Primary coral: `#DD614A` (shadow: `#C04535`)
- Accent green: `#73A580` (shadow: `#5A8468`)
- Salmon: `#F48668`, Peach: `#F4A698`, Sage: `#C5C392`
- Background: `#FFFFFF`
- Input background: `#F7F7F7`
- Border/divider: `#E5E5E5`
- Text primary: `#333333`
- Text secondary/placeholder: `#777777`
- Error red: `#EE2A33`

### Buttons
- `borderRadius: 16`, bold uppercase, `fontWeight: '800'`, `letterSpacing: 1`
- Primary: coral fill with darker bottom border (4px) for 3D effect
- Outline: white fill with gray border
- `Pressable` pressed state: `opacity: 0.85`, `translateY: 1`

### Inputs
- `borderRadius: 16`, `#F7F7F7` background, `#E5E5E5` border (2px)
- Padding: 16px horizontal, 14px vertical, `fontSize: 16`

### Typography
- Screen titles: `fontSize: 28`, `fontWeight: '800'`
- Subtitles: `fontSize: 16`, color `#777`
- Section labels: `fontSize: 14`, `fontWeight: '700'`, uppercase, `letterSpacing: 1`

### Layout
- `KeyboardAvoidingView` on screens with inputs
- Content padding: `24px` sides, `80px` top, `40px` bottom
- Element spacing: `12px` gap
- `ScrollView` with `keyboardShouldPersistTaps="handled"`

## Git

- Remote uses SSH alias `github-jediquinlan`
- Commits authored as `jediquinlan <jediquinlan@gmail.com>` (local git config)
- Do NOT add `Co-Authored-By` lines to commits
- Do NOT commit unless explicitly asked

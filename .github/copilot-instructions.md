# Imposter Radar Web - AI Coding Agent Instructions

## Project Overview
A single-page React app for playing "Imposter" (social deduction game) via WhatsApp message distribution. Players get secret words, and imposters receive different words. Built with Vite, React 19, and Spanish (Mexican/Guadalajara) UI text.

## Architecture & State Flow

**Single-component architecture:** `App.jsx` manages all state—no routing, no context providers. Three steps: `setup` → `round` → `summary` controlled by the `step` state variable.

**Core state pattern:**
- `players[]` - persists across rounds (name, phone, id)
- `round` object - ephemeral per game (categoryId, words, roles array, numImposters)
- `step` - controls which UI section renders

**Critical data flow:**
1. `startRound()` → shuffles players, assigns imposter roles, stores round state
2. Each role connects `playerId` to a player object via `players.find(p => p.id === r.playerId)`
3. WhatsApp integration via `openWhatsApp(phone, msg)` - constructs `wa.me` URL, doesn't actually send

## Key Conventions

**Spanish-first codebase:**
- All UI text, comments, and category content in Spanish (Mexican dialect, Guadalajara slang)
- Variable names in English, but user-facing strings are Spanish
- When adding categories: follow the `{common: "...", imposter: "..."}` pair structure in `src/data/categories.js`

**ESLint special rule:**
```javascript
'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]
```
Constants/components starting with uppercase are allowed to be unused (e.g., imports for future use).

**React 19 specifics:**
- Using `React.StrictMode` in `main.jsx`
- No TypeScript - plain JSX with `.jsx` extensions
- Vite HMR enabled for fast refresh

## Data Structure Patterns

**Categories (`src/data/categories.js`):**
```javascript
{
  id: "unique_id",
  name: "Display Name",
  type: "family" | "adult" | "mixed",  // Filters adult content
  pairs: [{ common: "word1", imposter: "word2" }, ...]
}
```

**Roles array structure:**
```javascript
{
  playerId: "abc123",
  isImposter: true/false,
  word: "assigned word",
  revealedLocally: false  // Toggle for on-screen reveal
}
```

## Development Workflows

**Start dev server:**
```bash
npm run dev
```
Opens on `http://localhost:5173` (Vite default)

**Lint:**
```bash
npm run lint
```
Flat config ESLint 9 - rules in `eslint.config.js`, ignores `dist/`

**Build:**
```bash
npm run build    # Outputs to dist/
npm run preview  # Preview production build
```

## WhatsApp Integration

**How it works:**
- `openWhatsApp(phone, text)` in `src/utils/whatsapp.js` opens `wa.me/{phone}?text={encodedMsg}`
- User must manually confirm send in WhatsApp web/app
- Phone numbers expected with country code (e.g., `+52...`)
- Missing phone numbers: UI shows "Sin número" pill, button alerts user

**Message template:** See `buildRoleMessage()` - includes player name, role, word, optional hint. Customize here for format changes.

## Styling Approach

**CSS custom properties in `:root`:**
- Dark theme: `--bg`, `--card`, `--accent` (green: `#10b981`)
- No CSS-in-JS, no Tailwind - single `styles.css` file
- Mobile-first with `@media (min-width: 640px)` adjustments

**Design system:**
- Buttons: `.btn`, `.btn.primary`, `.btn.ghost`, `.btn.small`
- Cards: `.card` with `var(--radius-lg)` rounded corners
- Pills: `.pill`, `.pill-danger` for tags/badges

## Common Tasks

**Add new category:**
1. Add object to `CATEGORIES` array in `src/data/categories.js`
2. Follow existing `type` conventions (`family`/`adult`/`mixed`)
3. Add 5-10 pairs minimum for variety

**Modify game logic:**
- Imposter assignment: `startRound()` in `App.jsx` (shuffle + slice logic)
- Validation: Currently alerts for < 3 players, adjusts imposters to max `players.length - 1`

**Change WhatsApp message format:**
Edit `buildRoleMessage()` in `src/utils/whatsapp.js` - uses template literal array joined with `\n`

## Testing & Debugging

**No test suite configured** - manual testing in browser required.

**Debugging rounds:**
- Use "Revelar en pantalla" button to inspect roles without sending WhatsApp messages
- Check `round` state in React DevTools to verify word assignment
- `toggleRevealLocal()` sets `revealedLocally` flag per player

## External Dependencies

**Runtime:**
- React 19.2.0 (latest, not LTS - uses new features)
- No state management libraries (useState only)
- No UI frameworks (custom CSS)

**Build:**
- Vite 7.2.2 with `@vitejs/plugin-react` (Babel-based Fast Refresh)
- ESLint 9 with flat config (`eslint.config.js`)

## File Organization

```
src/
  App.jsx          - Single component with all game logic
  main.jsx         - React root renderer
  styles.css       - Global styles
  data/
    categories.js  - Game word pairs and category logic
  utils/
    whatsapp.js    - WhatsApp URL helpers
```

No backend, no API calls, no localStorage - fully in-memory state.

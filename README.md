# shitty_app

Shitty Applications is a playground for intentionally "useless but fun" retro-styled web toys. Every app must follow the rules from `.codex/AGENTS.md` (retro UI, Japanese language, browser-only, preferably playful).

## Directory layout

- `apps/` — each shitty app lives in its own subdirectory with its own assets/readme.
  - `katakana-terminal/` — かたかな秘文ターミナル (CRT風ギャグ復号端末)。
- `main.go` — reserved for future tooling that may list/serve apps (currently empty).

## Adding another shitty app

1. Create a new folder under `apps/<your-app-name>`.
2. Drop your static assets there (`index.html`, CSS, JS, etc.).
3. Document how to play it in `apps/<your-app-name>/README.md`.
4. Keep it browser-only, retro, Japanese, and most importantly: fun but useless.

## Running an app

All current apps are static—open the corresponding `index.html` in a browser (no server needed). For example:

```bash
open apps/katakana-terminal/index.html
```

Feel free to add more delightfully terrible ideas under `apps/`.

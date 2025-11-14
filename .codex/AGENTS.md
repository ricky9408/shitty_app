# Repository Guidelines

## Project Structure & Module Organization

- `main.go` (root) is the single executable entrypoint today; keep it tiny and delegate logic into packages as the codebase grows.
- Place reusable code under `pkg/` and app-specific internals under `internal/`; mirror this layout in tests with matching `_test.go` files next to the source they exercise.
- Store developer-facing docs (like this file) at the repository root; add assets such as fixtures or sample payloads under `assets/` to keep binaries uncluttered.

## Build, Test, and Development Commands

- `go run .` — quickest way to launch the CLI locally; ideal for smoke-testing iterative changes.
- `go build -o bin/shitty_app ./...` — produces a reproducible binary in `bin/`; CI should call this to guarantee the tree compiles.
- `go test ./...` — executes every package test; add `-run <Regex>` when isolating failures and `-count=1` if caching masks issues.

## Coding Style & Naming Conventions

- Rely on `gofmt -w <file>` (or your editor’s on-save formatting) so tabs, spacing, and imports match canonical Go style.
- Use UpperCamelCase for exported identifiers and lowerCamelCase for locals and unexported functions; keep package names short, lower-case, and noun-based (`config`, `runner`).
- Favor small, purpose-built files over monoliths; when a file passes ~200 lines, consider splitting by responsibility.

## Testing Guidelines

- Write table-driven tests with Go’s `testing` package and keep helpers in the same package when they are test-only.
- Name tests `Test<ThingUnderTest>` and benchmark critical hotspots with `Benchmark<Thing>` when performance matters.
- Target meaningful coverage (critical paths, error branches, and CLI parsing). Run `go test ./... -cover` locally before opening a PR.

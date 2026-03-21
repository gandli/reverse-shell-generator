# Reverse Shell Generator Changelog

## [Unreleased] - 2026-03-21

### Added
- add listener alternatives for nc templates
- add 5 more reverse shell templates
- add 27 new reverse shell templates
- add bind shell templates and more reverse shells
- update extension icon with terminal/reverse-shell theme

### Changed
- migrate to Preferences API and devicon icons
- update action titles from contributions
- Pull contributions
- Pull contributions
- revert unused imports and fix action titles
- Update README.md
- Pull contributions
- revert unused imports and fix action titles
- Merge pull request #1 from gandli/dependabot/npm_and_yarn/npm_and_yarn-e5a595f223
- **deps-dev**: bump flatted
- trigger CI re-run
- add GitHub Actions workflow for automatic changelog generation
- Add Vitest test framework and unit tests
- Initial commit: Reverse Shell Generator extension

### Fixed
- correct action title casing for Re-enter IP/Port
- correct action title casing for Re-enter IP/Port
- address greptile-apps PR review comments
- resolve ESLint and Prettier validation errors
- wrap C# template with PowerShell compile-and-run command
- add prettier config, metadata folder, remove windows from nodejs
- use correct file extensions when saving, fix title case
- address PR review issues
- resolve minimatch ReDoS vulnerability

### Documentation
- update CHANGELOG.md with v1.1.0 release notes
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]
- update CHANGELOG.md [skip ci]

## [1.1.0] - 2026-03-21

### Added
- Support for 66+ reverse shell types
- devicon.dev SVG icons for all shell types
- OS filter icons (Linux, Windows, macOS) using devicon

### Changed
- **Migrated from LocalStorage to Preferences API** for better store approval
- Replaced emoji icons with professional devicon.dev icons
- Improved code quality with ESLint and Prettier

### Fixed
- Fixed `sqlite3-nc` template missing required fields
- Fixed various template inconsistencies

## [1.0.0] - Initial Release

- Added support for 40+ reverse shell types across multiple categories
- Added smart categorization system (Shell Tools, Scripting Languages, Compiled Languages, Windows, MSFVenom Payloads)
- Added OS filtering functionality for Linux, Windows, and macOS
- Added multiple copy options: raw command, URL encoding, Base64 encoding, and listener command
- Added configuration persistence using LocalStorage to auto-save IP address and port
- Added detailed command preview interface with markdown rendering
- Added export commands to file functionality
- Added keyboard shortcuts for all major actions
- Added multiple sorting options (by category, name, or OS)
- Added command details display including description, supported OS, listener setup, and security warnings
- Added complete documentation (README.md with screenshots)
- Added extension icon (512x512 PNG)
- Implemented TypeScript with full type safety
- Implemented form validation for IP addresses and port numbers
- Implemented code quality enforcement with ESLint and Prettier

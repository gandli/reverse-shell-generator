# Reverse Shell Generator Changelog

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

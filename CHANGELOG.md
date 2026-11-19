---
changelogVersion: 1
plugin: "gorquan_muse"
version: "1.1.5"
locale: "en"
translations:
  zh-CN: CHANGELOG.zh-CN.md
---
# Changelog

## [1.1.5]

### Added

- Set `size` to `auto` to let Muse choose the image shape.

### Fixed

- Image generation and edits now forward `output_format`, `reasoning_strength`, `tool_enablement`, and `user` to Meta, including explicitly disabled tools in multipart edits.
- The RC51 setup guide now lists the supported unprefixed Images API endpoints.

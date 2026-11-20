---
changelogVersion: 1
plugin: "gorquan_muse"
version: "1.2.3"
locale: "en"
translations:
  zh-CN: CHANGELOG.zh-CN.md
---
# Changelog

## [1.2.3]

### Added

- Set `temperature` and `moderation` on generation and edit requests.
- Read Meta's token `usage` in the response when available. Billing is per delivered image.

### Changed

- Request other width-by-height shapes, or omit `size` to use Meta's default.
- Generation and editing default to image URLs.

### Fixed

- Numbered reference images follow their indices, even if uploaded out of order.
- Reject unsupported JSON fields, non-text prompts and unsupported edit options before submitting a paid request. Non-string URL or Base64 fields no longer count as delivered images.

- Image responses include Meta's `background` field when present. Unknown `tool_enablement` options no longer block generation or editing.

### Migration

- Clients that relied on the 1.2.0 Base64 default must set `response_format` to `b64_json`.

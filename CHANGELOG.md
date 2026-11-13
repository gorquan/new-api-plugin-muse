---
changelogVersion: 1
plugin: "gorquan_muse"
version: "1.1.3"
locale: "en"
translations:
  zh-CN: CHANGELOG.zh-CN.md
---
# Changelog

## [1.1.3]

### Added

- Add the `muse-image-1.0` model for OpenAI-compatible image generation.
- Add OpenAI-compatible image editing through JSON and multipart requests.
- Support `n`, `size`, and `response_format` with up to 10 generated images.
- Accept URL, data URL, file reference, and multipart image inputs for edits.
- Report requested and returned image counts through the `image_count` billing field.

---
changelogVersion: 1
plugin: "gorquan_muse"
version: "1.1.5"
locale: "zh-CN"
---
# Changelog

## [1.1.5]

### Added

- 可将 `size` 设为 `auto`，让 Muse 自动选择画幅。

### Fixed

- 生图和编辑请求现在会向 Meta 转发 `output_format`、`reasoning_strength`、`tool_enablement` 和 `user`，包括 multipart 编辑中明确关闭的工具开关。
- 修正了 RC51 使用说明中的接口路径，生图和编辑均使用不带插件前缀的 Images API。

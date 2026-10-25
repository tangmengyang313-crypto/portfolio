# Avery 个人设计作品集

React 18、TypeScript、Vite 6、Framer Motion。图片与字体均在仓库内。

## 本地开发

```sh
npm ci
npm run dev -- --port 5174
```

## 发布

推送到 `main` 后由 GitHub Actions 自动构建并发布 GitHub Pages。

线上地址：https://tangmengyang313-crypto.github.io/portfolio/

部署基础路径由 `vite.config.js` 配置，本地运行仍使用 `/`。

## 高清素材

详情页采用原尺寸无损 PNG，只在浏览器中缩放。最新原版 PDF 因超过 GitHub 单文件限制按字节分成两个文件，`original-pdf.html` 在浏览器还原，并校验 SHA-256。分块不会更改 PDF 内容或清晰度。

旧素材、临时文件、node_modules、dist 不纳入仓库。

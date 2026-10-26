# 图片与加载性能优化记录

日期：2026-10-26。MB 按 1,000,000 字节计算；MiB 按 1,048,576 字节计算。

| 项目 | 张数 | 原 PNG / MB | 网页 WebP / MB | 减少 |
|---|---:|---:|---:|---:|
| foilsense | 22 | 226.06 | 3.31 | 98.53% |
| leke | 19 | 195.18 | 3.05 | 98.44% |
| commerce | 22 | 220.79 | 6.83 | 96.91% |
| campaign | 9 | 89.61 | 3.07 | 96.57% |

72 张详情图合计：731.65 MB → 16.27 MB，减少 97.78%。全部保持 1920px 原宽和原始高度，不裁切、不改变比例。

## 画质与原图

- 71 张采用 WebP Quality 90；campaign/09.webp 采用无损 WebP，避免细密文字和图形损失。
- 原始 PNG 原样归档到 originals/case-studies-latest；逐张 SHA-256 校验一致。原图不再进入 Vite public 的发布目录。
- Hero 使用逐像素一致的无损透明 WebP：2,269,194 → 1,403,050 字节。原 PNG 保留于 originals/hero。
- 对比了 FolliSense 01/04/12 及其他三组的中文、图标、细线与渐变局部，样本未见明显模糊；有损 WebP 并非像素完全一致。
- FolliSense 的最低 RGB PSNR 为 40.81 dB。PSNR 只用于筛查，不等同于主观画质或中文 OCR 保证。

## 加载逻辑

- Hero 为高优先级；仅首页提前发起 Hero 的预加载，项目详情入口不会预加载 Hero。
- 详情页首图立即加载；其余图片通过一个共享 IntersectionObserver，接近视口前 700px 才设置 src。
- 保留 width/height 和 height:auto，加载前保留准确尺寸；图片异步解码。
- 横向画廊、About 装饰和 Projects 封面使用同样的视口门控；不再依赖浏览器可能提前数屏触发的原生 lazy 阈值。
- 三组画廊副本使用完全相同的图片 URL，不加随机参数，允许浏览器复用缓存。缓存命中率尚未取得线上复测。
- PDF 仍按点击后的独立查看页加载分块；首页、详情页没有 PDF 预取。

## 测量与验证范围

- 优化前本地浏览器 FolliSense 初次打开实际请求了 4 张 PNG，共 41,493,056 字节。该次 LCP 1,960 ms，CLS 约 0.000646；不是线上或手机弱网数据。
- 首页前测记录到 24 个图片资源，合计 8,470,821 字节；该样本跨越后台等待，其 LCP 数值无效，不用于对比。
- 首张图片本地 HTTP 请求体实测：10,373,264 → 155,316 字节，减少 98.50%。PNG 三次耗时 226.98/39.62/29.79 ms；WebP 三次为 17.04/1.80/13.41 ms。包含系统缓存影响，不是浏览器 LCP，不代表公网加载时长。
- 新版 JS：300,968 → 301,806 字节；构建 gzip 约 97.27 → 97.60 kB。增加约 0.33 kB gzip 用于共享加载门控。
- 本次部署文件目录为 135,204,768 字节（约 129 MiB），之前约 812 MiB。源码仓库仍保留原 PNG，因此仓库总量不会随网页发布体积同幅缩小。
- 72 个优化图 URL 返回 HTTP 200，Content-Length 均与本地文件一致；原图哈希、优化图尺寸、PDF 分块总长已校验。
- 加载行为测试通过：首图立即有 src、后续无 src、700px 预载、离屏不载、进入后仅载一次、卸载清理、尺寸占位和异步解码。
- CSS 源文件与已部署提交一致；Hash 路由和 /portfolio/ 基础路径保留；生产构建通过。
- 线上页面访问/Fetch 曾出现连接超时或重置；续接任务时浏览器控制工具不再可用。新版浏览器 LCP/CLS、手机弱网、滚动流畅性、缓存命中率尚未实测，不能声称已改善了某个具体毫秒数。

## 部署

优化代码已正常推送：ecf95d63a0fd9e76fd08d61e93f3bef24a513d32。未使用 force push。

发现 Pages 同时从 main 根目录执行默认 Jekyll 发布，覆盖 Vite 构建；已将发布源由 legacy 改为 workflow，并重新运行现有部署工作流。

已确认成功的部署运行：https://github.com/tangmengyang313-crypto/portfolio/actions/runs/40282025915

线上地址保持 https://tangmengyang313-crypto.github.io/portfolio/ 。首页已返回正确的 Vite 构建入口 index-BkNGS1JO.js；四组项目首图、Hero WebP、campaign/09.webp、JS 和 PDF 入口/清单均返回 HTTP 200，并与本地构建匹配（文本文件规范化换行后比较，图片与脚本逐字节比较）。PDF 首末分块仅用 HEAD 检查，未下载整份文件。

CDN 响应包含 Cache-Control: max-age=600。线上 FolliSense 首图实收 155,316 字节；本轮一次请求用时 921.5 ms，仅为资源请求耗时，不能等同于 LCP 或代表所有用户网络。

线上资源校验明细见 performance-online-verification.json。真实浏览器滚动、手机弱网及优化后的 LCP/CLS 仍未完成复测，不宣称其具体提升比例。

## 重生成

安装 Pillow 后，在任意目录运行 `python scripts/optimize-images.py`。脚本从 originals 读取，写入 public/assets/case-studies-webp/v1，原文件不修改。

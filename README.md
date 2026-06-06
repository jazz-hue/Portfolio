# 王玮 · 作品集网站 Portfolio 2025

单 HTML + Three.js + GSAP 的动态作品集站，无构建，可直接打开预览或推到 GitHub Pages。

## 文件结构

```
个人作品集网站/
├─ 01封面 / 02目录 / 03个人介绍 ... 13联系方式/   ← 你的原始分类图（保留）
└─ web/                                       ← 网站本体（推这个文件夹到 GitHub）
   ├─ index.html         主页
   ├─ manifest.json      图片清单（脚本自动生成）
   ├─ update.bat         双击 → 增量压缩 + 重建清单
   ├─ update.py          压缩脚本（被 update.bat 调用）
   ├─ images/            压缩后的 WebP（自动生成）
   └─ README.md
```

## 本地预览

直接双击 `web/index.html` 即可，或：

```bash
cd web
python -m http.server 5500
# 浏览器打开 http://localhost:5500
```

## 后续添加新作品

把新图丢进对应的中文分区文件夹（比如 `11AI设计\03人像\`），然后**双击 `web/update.bat`**，自动：
1. 增量压缩新图（已存在的跳过，不重复处理）
2. 重建 `manifest.json`
3. 完成后 git push 即可

第一次运行需要 Python + Pillow：

```bash
pip install Pillow
```

## 部署到 GitHub Pages

```bash
# 1. 把整个 web/ 文件夹推到 GitHub 新仓库（建议仓库名 = 你的用户名.github.io）
cd web
git init
git add .
git commit -m "portfolio v1"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main

# 2. GitHub 仓库页 → Settings → Pages → Source 选 main 分支 / 根目录 → Save
# 3. 等 1-2 分钟，访问 https://<你的用户名>.github.io/<仓库名>/
```

如果用户名仓库（`username.github.io`）就直接是 `https://username.github.io/`。

## 自定义域名（可选）

仓库 Settings → Pages → Custom domain 填入你的域名，然后在域名 DNS 加一条 `CNAME` 指向 `<你的用户名>.github.io`。

## 视频替换

主页有"AI Product Reel · 即将上线"占位区。视频做好后：
1. 把视频文件（推荐 mp4，<25 MB）放进 `web/videos/reel.mp4`
2. 编辑 `manifest.json` → `video.src` 改为 `"videos/reel.mp4"`
3. 也可以编辑 `index.html` 里 `videoFrame` 块，把图换成 `<video>` 标签

## 关键参数（在 index.html / update.py 顶部）

| 项 | 默认 | 说明 |
|---|---|---|
| `THUMB_MAX` | 800px | 缩略图最长边 |
| `FULL_MAX` | 1800px | 灯箱大图最长边 |
| `THUMB_Q / FULL_Q` | 78 / 82 | WebP 质量 |
| Three.js 粒子数 | 4500（桌面）/ 1800（手机） | 在 `index.html` 的 `N = isMobile ? 1800 : 4500` |

## 颜色与字体

在 `index.html` 顶部 `:root` 改一改：

```css
--accent: #ff4d2e;   /* 主点缀色 */
--accent2: #ffd84d;  /* 第二点缀色 */
--bg: #0a0a0c;       /* 背景 */
--fg: #f4f4f6;       /* 前景 */
```

字体来源 Google Fonts：Space Grotesk + Noto Serif SC。

---

© 2025 王玮 / Wang Wei · Shenzhen

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""一键更新：扫描父目录的中文分区文件夹 → 压缩成 WebP → 写 manifest.json
跨平台：脚本位于 web/，源图位于 web/.. 下的中文文件夹"""
import os, sys, json
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    print("\n[!] 缺少依赖：Pillow\n请先在命令行运行：  pip install Pillow\n")
    sys.exit(1)

SCRIPT = Path(__file__).resolve().parent           # …/web
ROOT   = SCRIPT.parent                              # …/个人作品集网站
OUT    = SCRIPT / "images"
OUT.mkdir(parents=True, exist_ok=True)

SECTIONS = [
    ("04海报设计",  "posters",      "海报设计",    "Poster Design",   "main"),
    ("05A+设计",   "aplus",        "A+设计",      "A+ Design",       "main"),
    ("06主图设计",  "products",     "主图设计",    "Product Design",  "main"),
    ("07H5设计",   "h5",           "H5 设计",     "H5 Design",       "main"),
    ("08banner设计","banners",     "Banner 设计", "Banner Design",   "main"),
    ("09网页设计",  "webdesign",    "网页设计",    "Web Design",      "main"),
    ("10插画设计",  "illustration", "插画设计",    "Illustration",    "main"),
    ("11AI设计",   "ai",           "AI 设计",     "AI Design",       "ai"),
    ("12摄影作品",  "photography",  "摄影作品",    "Photography",     "main"),
]

AI_SUBS = {
    "03人像":          ("portraits",     "人像", "Portraits"),
    "04个人风格想法图":  ("personal",      "个人风格", "Personal Style"),
    "05AI产品设计":      ("ai-product",    "AI 产品", "AI Product"),
    "1古希腊诸神":       ("greek-gods",    "古希腊诸神", "Greek Gods"),
    "2漫威":            ("marvel",        "漫威", "Marvel"),
}

THUMB_MAX, FULL_MAX, THUMB_Q, FULL_Q = 800, 1800, 78, 82
EXTS = {".png",".jpg",".jpeg",".webp",".jfif",".bmp",".tif",".tiff"}

# Pillow 大图安全阈值
Image.MAX_IMAGE_PIXELS = 500_000_000

def compress(src, dst_thumb, dst_full):
    if dst_thumb.exists() and dst_full.exists():
        return
    img = Image.open(src)
    img = ImageOps.exif_transpose(img)
    if img.mode in ("RGBA","LA"):
        bg = Image.new("RGB", img.size, (12,12,14))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    elif img.mode != "RGB":
        img = img.convert("RGB")
    f = img.copy(); f.thumbnail((FULL_MAX, FULL_MAX), Image.LANCZOS)
    dst_full.parent.mkdir(parents=True, exist_ok=True)
    f.save(dst_full, "WEBP", quality=FULL_Q, method=5)
    t = img.copy(); t.thumbnail((THUMB_MAX, THUMB_MAX), Image.LANCZOS)
    dst_thumb.parent.mkdir(parents=True, exist_ok=True)
    t.save(dst_thumb, "WEBP", quality=THUMB_Q, method=5)

def collect_images(folder):
    if not folder.exists(): return []
    return sorted([p for p in folder.iterdir() if p.is_file() and p.suffix.lower() in EXTS],
                  key=lambda p: p.name)

def main():
    print("==== 作品集站更新 ====")
    print(f"源目录: {ROOT}")
    print(f"输出 : {OUT}\n")

    manifest = {
        "profile": {
            "name_cn":"王玮","name_en":"Wang Wei",
            "title_cn":"平面设计师 / 视觉传达","title_en":"Graphic Designer & AI Artist",
            "school":"兰州城市学院 视觉传达设计专业",
            "intro_cn":"您好，我是王玮，一名专注于平面设计的设计师。熟练掌握 Photoshop、Illustrator 等设计软件，熟悉运用各种 AI 工具：MJ、ComfyUI、Nano Banana、Runway，具备扎实的创意设计和品牌视觉表达能力。热爱标志设计、摄影与探索新鲜事物，相信设计可以为生活注入无限可能。",
            "intro_en":"Hi, I'm Wang Wei — a graphic designer focused on visual communication. Proficient in Photoshop, Illustrator and AI tools (Midjourney, ComfyUI, Nano Banana, Runway).",
            "email":"wean1234580@gmail.com","wechat":"15609344927","qq":"2298833893","phone":"15609344927",
            "location_cn":"深圳，中国","location_en":"Shenzhen, China",
            "avatar":"images/about/avatar.webp",
        },
        "video": {"placeholder":"images/about/video-cover.webp","src":""},
        "sections": []
    }

    (OUT/"about").mkdir(parents=True, exist_ok=True)
    av = ROOT / "03个人介绍" / "个人头像.png"
    if av.exists():
        im = Image.open(av); im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((1200,1200), Image.LANCZOS)
        im.save(OUT/"about"/"avatar.webp","WEBP",quality=86,method=5)
        print("✓ avatar")

    banner_first = next(iter(collect_images(ROOT/"08banner设计")), None)
    if banner_first and not (OUT/"about"/"video-cover.webp").exists():
        im = Image.open(banner_first); im = ImageOps.exif_transpose(im).convert("RGB")
        im.thumbnail((1920,1080), Image.LANCZOS)
        im.save(OUT/"about"/"video-cover.webp","WEBP",quality=80,method=5)
        print("✓ video-cover")

    for cn, slug, ct, et, kind in SECTIONS:
        folder = ROOT / cn
        section = {"slug":slug,"title_cn":ct,"title_en":et,"kind":kind,"items":[],"groups":[]}
        if kind == "ai":
            if folder.exists():
                for sub in sorted(os.listdir(folder)):
                    sp = folder / sub
                    if not sp.is_dir(): continue
                    sub_slug, sub_ct, sub_et = AI_SUBS.get(sub, (sub.replace(" ","_"), sub, sub))
                    grp = {"slug":sub_slug,"title_cn":sub_ct,"title_en":sub_et,"items":[]}
                    for i, src in enumerate(collect_images(sp), 1):
                        nm = f"{i:03d}.webp"
                        dt = OUT/slug/sub_slug/"thumb"/nm
                        df = OUT/slug/sub_slug/"full"/nm
                        try:
                            compress(src, dt, df)
                            grp["items"].append({
                                "thumb":f"images/{slug}/{sub_slug}/thumb/{nm}",
                                "full":f"images/{slug}/{sub_slug}/full/{nm}",
                                "src_name":src.name,
                            })
                        except Exception as e:
                            print(f"  ! {src.name}: {e}")
                    section["groups"].append(grp)
                    print(f"  ✓ ai/{sub_slug}: {len(grp['items'])}")
        else:
            for i, src in enumerate(collect_images(folder), 1):
                nm = f"{i:03d}.webp"
                dt = OUT/slug/"thumb"/nm
                df = OUT/slug/"full"/nm
                try:
                    compress(src, dt, df)
                    section["items"].append({
                        "thumb":f"images/{slug}/thumb/{nm}",
                        "full":f"images/{slug}/full/{nm}",
                        "src_name":src.name,
                    })
                except Exception as e:
                    print(f"  ! {src.name}: {e}")
            print(f"✓ {slug}: {len(section['items'])}")
        manifest["sections"].append(section)

    (SCRIPT/"manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("\n→ manifest.json 已更新")
    print("→ 完成。现在可以 git add + git commit + git push 部署到 GitHub Pages")

if __name__ == "__main__":
    main()

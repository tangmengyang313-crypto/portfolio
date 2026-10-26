"""Generate full-resolution web assets without changing original PNGs. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat
import argparse, json, hashlib, math
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('projects',nargs='*',default=['foilsense','leke','commerce','campaign']);args=parser.parse_args()
report_path=root/'docs/performance-images.json';report_path.parent.mkdir(exist_ok=True)
report=json.loads(report_path.read_text(encoding='utf-8')) if report_path.exists() else {}
for project in args.projects:
 source=root/'public/assets/case-studies-latest'/project
 if not source.exists():source=root/'originals/case-studies-latest'/project
 dest=root/'public/assets/case-studies-webp/v1'/project;dest.mkdir(parents=True,exist_ok=True)
 rows=[]
 for path in sorted(source.glob('*.png')):
  image=Image.open(path).convert('RGB');target=dest/(path.stem+'.webp');quality=90
  image.save(target,'WEBP',quality=quality,method=6)
  decoded=Image.open(target).convert('RGB');stats=ImageStat.Stat(ImageChops.difference(image,decoded));mse=sum(v*v for v in stats.rms)/3;psnr=10*math.log10(255**2/mse) if mse else 99
  if psnr<38:
   quality=94;image.save(target,'WEBP',quality=quality,method=6)
   decoded=Image.open(target).convert('RGB');stats=ImageStat.Stat(ImageChops.difference(image,decoded));mse=sum(v*v for v in stats.rms)/3;psnr=10*math.log10(255**2/mse) if mse else 99
  lossless=psnr<38
  if lossless:image.save(target,'WEBP',lossless=True,exact=True,method=6);psnr=99
  assert Image.open(target).size==image.size
  rows.append(dict(file=path.name,width=image.width,height=image.height,originalBytes=path.stat().st_size,webpBytes=target.stat().st_size,quality=quality,lossless=lossless,psnr=round(psnr,2),originalSha256=hashlib.sha256(path.read_bytes()).hexdigest()))
 report[project]=dict(images=rows,originalBytes=sum(r['originalBytes'] for r in rows),webpBytes=sum(r['webpBytes'] for r in rows))
 report_path.write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
 print(project,len(rows),report[project]['originalBytes'],report[project]['webpBytes'],flush=True)

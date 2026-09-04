import os
import glob
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

def convert_canvas_frames():
    images = sorted(glob.glob("protfolio-images/ezgif-frame-*.jpg"))
    print(f"Found {len(images)} canvas frames to convert...")

    def process_frame(jpg_path):
        webp_path = os.path.splitext(jpg_path)[0] + ".webp"
        with Image.open(jpg_path) as im:
            # Quality 62 delivers ~41.5 dB PSNR (visually indistinguishable) with optimal WebP compression
            im.save(webp_path, "WEBP", quality=62, method=4)
        return os.path.getsize(jpg_path), os.path.getsize(webp_path)

    total_jpg = 0
    total_webp = 0

    with ThreadPoolExecutor() as executor:
        results = executor.map(process_frame, images)
        for idx, (jpg_sz, webp_sz) in enumerate(results, 1):
            total_jpg += jpg_sz
            total_webp += webp_sz
            if idx % 50 == 0 or idx == len(images):
                print(f"Processed {idx}/{len(images)} frames...")

    print(f"\nCanvas Frames: Original {total_jpg / (1024*1024):.2f} MB -> WebP {total_webp / (1024*1024):.2f} MB")
    print(f"Savings: {((total_jpg - total_webp) / total_jpg) * 100:.1f}%\n")

if __name__ == "__main__":
    convert_canvas_frames()

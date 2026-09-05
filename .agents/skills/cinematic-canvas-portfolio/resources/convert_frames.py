import os
import glob
from PIL import Image

def convert_frames(input_dir, output_dir=None, max_width=1280, quality=80, fmt="JPEG"):
    if output_dir is None:
        output_dir = input_dir
    os.makedirs(output_dir, exist_ok=True)

    patterns = ["*.png", "*.jpg", "*.jpeg"]
    files = []
    for p in patterns:
        files.extend(glob.glob(os.path.join(input_dir, p)))
    files.sort()

    print(f"Processing {len(files)} frames from {input_dir}...")

    for i, file_path in enumerate(files):
        try:
            with Image.open(file_path) as img:
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                
                # Resize if width exceeds max_width
                if img.width > max_width:
                    ratio = max_width / float(img.width)
                    new_height = int(float(img.height) * ratio)
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

                pad_idx = str(i + 1).padStart(3, "0") if hasattr(str, 'padStart') else f"{i+1:03d}"
                ext = "webp" if fmt.upper() == "WEBP" else "jpg"
                out_name = f"ezgif-frame-{pad_idx}.{ext}"
                out_path = os.path.join(output_dir, out_name)

                img.save(out_path, fmt, quality=quality, optimize=True)
        except Exception as e:
            print(f"Error converting {file_path}: {e}")

    print("Sequence optimization complete.")

if __name__ == "__main__":
    import sys
    src = sys.argv[1] if len(sys.argv) > 1 else "./raw-frames"
    dst = sys.argv[2] if len(sys.argv) > 2 else "./protfolio-images"
    convert_frames(src, dst)

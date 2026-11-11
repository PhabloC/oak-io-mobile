from collections import deque
from pathlib import Path

from PIL import Image

assets_dir = Path(
    r"C:\Users\phabl\.cursor\projects\c-Users-phabl-Desktop-projects-oak-io\assets"
)
icons_dir = Path(__file__).resolve().parents[1] / "public" / "icons"
names = [
    "salario",
    "freelance",
    "investimentos",
    "presente",
    "venda",
    "alimentacao",
    "transporte",
    "saude",
    "educacao",
    "lazer",
    "moradia",
    "roupas",
    "tecnologia",
    "contas",
    "cdb",
    "tesouro",
    "acoes",
    "fiis",
    "poupanca",
    "outros",
    "ganho",
    "gasto",
]


def near_bg(pixel, avg, tol=30):
    r, g, b = pixel[:3]
    return (
        abs(r - avg[0]) < tol
        and abs(g - avg[1]) < tol
        and abs(b - avg[2]) < tol
        and (r + g + b) > 580
    )


def process(name: str) -> None:
    src = assets_dir / f"logo-{name}.jpg"
    dst = icons_dir / f"logo-{name}.png"
    im = Image.open(src).convert("RGBA")
    w, h = im.size
    pixels = im.load()

    samples = [pixels[2, 2], pixels[w - 3, 2], pixels[2, h - 3], pixels[w - 3, h - 3]]
    avg = tuple(sum(c[i] for c in samples) // 4 for i in range(3))

    # Flood-fill only background connected to corners (keeps white glyph intact).
    visited = [[False] * w for _ in range(h)]
    queue = deque([(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)])

    while queue:
        x, y = queue.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        visited[y][x] = True
        if not near_bg(pixels[x, y], avg):
            continue
        pixels[x, y] = (0, 0, 0, 0)
        queue.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    bbox = im.getbbox()
    if not bbox:
        return

    cropped = im.crop(bbox)
    cw, ch = cropped.size
    side = max(cw, ch)
    pad = int(side * 0.02)
    canvas_side = side + pad * 2
    canvas = Image.new("RGBA", (canvas_side, canvas_side), (0, 0, 0, 0))
    canvas.paste(cropped, ((canvas_side - cw) // 2, (canvas_side - ch) // 2), cropped)
    out = canvas.resize((512, 512), Image.Resampling.LANCZOS)
    out.save(dst, "PNG")
    print(f"processed {dst.name}")


if __name__ == "__main__":
    for name in names:
        process(name)
    print("done")

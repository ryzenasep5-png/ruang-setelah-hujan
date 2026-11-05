#!/usr/bin/env python3
"""Generate original, deterministic cinematic scene art for Ruang Setelah Hujan.

The artwork is procedural: gradients, blurred light, silhouettes, rain, and grain are
created from a fixed seed. No source photographs or third-party image assets are used.
Requires Pillow (``python -m pip install pillow``) for JPG/WEBP encoding.
"""

from __future__ import annotations

import argparse
import math
import random
from pathlib import Path
from typing import Iterable

try:
    from PIL import Image, ImageDraw, ImageFilter
except ImportError as exc:  # pragma: no cover - exercised only on missing dependency
    raise SystemExit(
        "This generator requires Pillow. Install it with `python -m pip install pillow`."
    ) from exc


Color = tuple[int, int, int]

# Midnight-blue and violet palettes vary the emotional temperature while preserving a
# common cinematic language. Every scene is generated from these values and a seed.
PALETTES: tuple[tuple[Color, Color, Color, Color, Color], ...] = (
    ((7, 12, 35), (27, 27, 69), (79, 66, 126), (7, 9, 24), (178, 158, 255)),
    ((8, 18, 42), (24, 44, 82), (102, 101, 162), (8, 11, 29), (152, 199, 255)),
    ((13, 9, 35), (41, 25, 75), (123, 74, 144), (12, 7, 28), (229, 166, 215)),
    ((6, 20, 38), (19, 56, 82), (80, 130, 157), (5, 12, 25), (157, 221, 227)),
    ((16, 12, 39), (50, 31, 80), (132, 96, 156), (13, 8, 26), (255, 181, 215)),
    ((7, 13, 29), (27, 35, 63), (87, 100, 139), (6, 8, 19), (169, 204, 235)),
    ((11, 8, 32), (36, 27, 79), (96, 73, 148), (10, 6, 25), (186, 163, 255)),
    ((5, 18, 38), (18, 48, 78), (68, 105, 141), (4, 10, 24), (128, 198, 245)),
    ((18, 9, 30), (57, 24, 65), (129, 66, 104), (15, 6, 23), (242, 166, 187)),
    ((8, 11, 31), (35, 34, 82), (107, 93, 151), (6, 8, 22), (191, 196, 255)),
    ((9, 18, 36), (34, 43, 71), (92, 116, 141), (5, 11, 23), (173, 220, 214)),
    ((14, 7, 33), (39, 24, 72), (111, 61, 130), (10, 5, 24), (232, 160, 255)),
)


def mix(first: Color, second: Color, amount: float) -> Color:
    amount = max(0.0, min(1.0, amount))
    return tuple(round(a + (b - a) * amount) for a, b in zip(first, second))  # type: ignore[return-value]


def clamp_channel(value: float) -> int:
    return max(0, min(255, round(value)))


def draw_glow(base: Image.Image, center: tuple[int, int], radius: int, color: Color, alpha: int) -> None:
    glow = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(max(2, radius // 3)))
    base.paste(glow, (0, 0), glow)


def jagged_horizon(rng: random.Random, width: int, baseline: int, amplitude: int, points: int) -> list[tuple[int, int]]:
    result = [(0, baseline + rng.randint(-amplitude, amplitude))]
    for point in range(1, points):
        x = round(width * point / (points - 1))
        y = baseline + rng.randint(-amplitude, amplitude)
        result.append((x, y))
    return result


def render_scene(index: int, width: int, height: int) -> Image.Image:
    rng = random.Random(20261105 + index * 9973)
    sky_top, sky_mid, horizon, foreground, glow = PALETTES[index % len(PALETTES)]
    image = Image.new("RGB", (width, height))
    pixels = image.load()

    # Multi-stop vertical gradient with restrained film grain.
    for y in range(height):
        t = y / max(1, height - 1)
        if t < 0.56:
            color = mix(sky_top, sky_mid, t / 0.56)
        else:
            color = mix(sky_mid, horizon, (t - 0.56) / 0.44)
        for x in range(width):
            grain = rng.uniform(-2.2, 2.2)
            pixels[x, y] = tuple(clamp_channel(channel + grain) for channel in color)

    draw_glow(image, (round(width * (0.2 + rng.random() * 0.6)), round(height * (0.28 + rng.random() * 0.22))), round(width * 0.22), glow, 56)
    draw_glow(image, (round(width * (0.7 + rng.random() * 0.18)), round(height * 0.63),), round(width * 0.12), glow, 38)

    # Distant hills and a low reflective shoreline.
    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    distant = jagged_horizon(rng, width, round(height * 0.63), round(height * 0.035), 14)
    draw.polygon([(0, height), *distant, (width, height)], fill=(*mix(horizon, foreground, 0.48), 150))
    near = jagged_horizon(rng, width, round(height * 0.74), round(height * 0.06), 11)
    draw.polygon([(0, height), *near, (width, height)], fill=(*foreground, 220))

    # A sparse skyline creates scale without implying a real location.
    skyline_y = round(height * 0.69)
    for _ in range(18):
        building_width = rng.randint(max(12, width // 100), max(24, width // 40))
        x = rng.randint(0, max(1, width - building_width))
        building_height = rng.randint(round(height * 0.025), round(height * 0.12))
        draw.rectangle((x, skyline_y - building_height, x + building_width, skyline_y), fill=(*mix(foreground, (2, 4, 14), 0.2), rng.randint(130, 210)))
        if rng.random() > 0.5:
            draw.line((x + building_width // 2, skyline_y - building_height, x + building_width // 2, skyline_y - building_height - rng.randint(4, 18)), fill=(*glow, 90), width=1)

    image = Image.alpha_composite(image.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(image, "RGBA")

    # Rain lines, reflections, and a few distant points of warm light.
    for _ in range(round(width / 9)):
        x = rng.randint(-width // 8, width + width // 8)
        y = rng.randint(-height // 6, height)
        length = rng.randint(round(height * 0.012), round(height * 0.08))
        draw.line((x, y, x - round(length * 0.16), y + length), fill=(*mix((204, 220, 255), glow, 0.35), rng.randint(22, 72)), width=rng.choice((1, 1, 1, 2)))

    for _ in range(24):
        x = rng.randint(round(width * 0.04), round(width * 0.96))
        y = rng.randint(round(height * 0.58), round(height * 0.75))
        radius = rng.randint(1, 3)
        draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*glow, rng.randint(90, 185)))
        draw.line((x, y + radius * 2, x + rng.randint(-10, 10), y + rng.randint(7, 28)), fill=(*glow, 45), width=1)

    # Subtle vignette keeps the center available for copy/lyrics.
    vignette = Image.new("L", image.size, 0)
    vignette_pixels = vignette.load()
    cx, cy = width * 0.5, height * 0.48
    max_distance = math.sqrt((width * 0.62) ** 2 + (height * 0.62) ** 2)
    for y in range(height):
        for x in range(width):
            distance = math.sqrt(((x - cx) / 1.08) ** 2 + (y - cy) ** 2) / max_distance
            vignette_pixels[x, y] = round(max(0.0, min(1.0, distance)) ** 1.65 * 175)
    shade = Image.new("RGBA", image.size, (2, 3, 13, 0))
    shade.putalpha(vignette)
    image = Image.alpha_composite(image, shade)
    return image.convert("RGB")


def generate(output: Path, width: int, height: int, count: int) -> Iterable[Path]:
    output.mkdir(parents=True, exist_ok=True)
    written: list[Path] = []
    for index in range(count):
        image = render_scene(index, width, height)
        stem = f"scene-{index + 1:02d}"
        jpg_path = output / f"{stem}.jpg"
        webp_path = output / f"{stem}.webp"
        image.save(jpg_path, format="JPEG", quality=91, optimize=True, progressive=True)
        image.save(webp_path, format="WEBP", quality=89, method=6)
        written.extend((jpg_path, webp_path))
    return written


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "public" / "scenes")
    parser.add_argument("--width", type=int, default=1600)
    parser.add_argument("--height", type=int, default=900)
    parser.add_argument("--count", type=int, default=12)
    args = parser.parse_args()
    if args.width < 320 or args.height < 180:
        parser.error("width must be at least 320 and height at least 180")
    if args.count < 12:
        parser.error("count must be at least 12")
    written = list(generate(args.output, args.width, args.height, args.count))
    print(f"Generated {len(written)} original scene assets in {args.output}")
    for path in written:
        print(path.name)


if __name__ == "__main__":
    main()

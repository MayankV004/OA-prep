"""Compute WCAG 2.1 contrast ratios for the theme tokens in app/globals.css.

Parses the oklch() values straight out of the stylesheet, converts
oklch -> OKLab -> linear sRGB -> sRGB, then reports contrast ratios for the
pairs that matter in the UI. Run: python3 scripts/check-contrast.py
"""

import math
import re
import sys
from pathlib import Path

CSS = Path(__file__).resolve().parent.parent / "app" / "globals.css"


def oklch_to_srgb(L, C, h_deg, alpha=1.0):
    h = math.radians(h_deg)
    a = C * math.cos(h)
    b = C * math.sin(h)

    l_ = L + 0.3963377774 * a + 0.2158037573 * b
    m_ = L - 0.1055613458 * a - 0.0638541728 * b
    s_ = L - 0.0894841775 * a - 1.2914855480 * b

    l, m, s = l_ ** 3, m_ ** 3, s_ ** 3

    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    return tuple(max(0.0, min(1.0, v)) for v in (r, g, bb))


def relative_luminance(linear_rgb):
    r, g, b = linear_rgb
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def contrast(fg_linear, bg_linear):
    l1 = relative_luminance(fg_linear)
    l2 = relative_luminance(bg_linear)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def composite(fg, alpha, bg):
    """Flatten a translucent foreground onto an opaque backdrop."""
    return tuple(fg[i] * alpha + bg[i] * (1 - alpha) for i in range(3))


OKLCH = re.compile(
    r"oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:/\s*([\d.]+)%\s*)?\)"
)


def parse_blocks(text):
    """Return {scope: {token: value}} for :root and .dark."""
    scopes = {}
    for scope, pattern in (
        ("light", r":root\s*\{(.*?)\n\}"),
        ("dark", r"\.dark\s*\{(.*?)\n\}"),
    ):
        match = re.search(pattern, text, re.S)
        if not match:
            sys.exit(f"Could not find the {scope} token block in globals.css")
        body = match.group(1)
        tokens = dict(re.findall(r"(--[\w-]+):\s*([^;]+);", body))
        scopes[scope] = {k: v.strip() for k, v in tokens.items()}
    return scopes


def resolve(tokens, name, depth=0):
    """Resolve a token to (linear_rgb, alpha), following var() aliases."""
    if depth > 12:
        return None
    raw = tokens.get(name)
    if raw is None:
        return None

    alias = re.fullmatch(r"var\((--[\w-]+)\)", raw)
    if alias:
        return resolve(tokens, alias.group(1), depth + 1)

    m = OKLCH.search(raw)
    if not m:
        return None

    L, C, h = float(m.group(1)), float(m.group(2)), float(m.group(3))
    alpha = float(m.group(4)) / 100 if m.group(4) else 1.0
    return oklch_to_srgb(L, C, h), alpha


# (label, foreground token, background token, required ratio)
# 4.5 for body text, 3.0 for large text and UI component boundaries.
PAIRS = [
    ("body text on page",            "--foreground",          "--background",       4.5),
    ("body text on card",            "--foreground",          "--card",             4.5),
    ("secondary text on page",       "--text-secondary",      "--background",       4.5),
    ("secondary text on card",       "--text-secondary",      "--card",             4.5),
    ("muted text on page",           "--muted-foreground",    "--background",       4.5),
    ("muted text on card",           "--muted-foreground",    "--card",             4.5),
    ("muted text on sunken",         "--muted-foreground",    "--surface-sunken",   4.5),
    ("muted text on sidebar",        "--muted-foreground",    "--sidebar",          4.5),
    ("accent link on page",          "--primary",             "--background",       4.5),
    ("accent link on card",          "--primary",             "--card",             4.5),
    ("text on accent button",        "--primary-foreground",  "--primary",          4.5),
    ("accent text on accent tint",   "--accent-foreground",   "--accent",           4.5),
    ("danger text on page",          "--destructive",         "--background",       4.5),
    ("danger text on card",          "--destructive",         "--card",             4.5),
    ("success text on card",         "--success",             "--card",             4.5),
    ("warning text on card",         "--warning",             "--card",             4.5),
    ("info text on card",            "--info",                "--card",             4.5),
    ("text on success fill",         "--success-foreground",  "--success",          4.5),
    ("text on warning fill",         "--warning-foreground",  "--warning",          4.5),
    ("text on info fill",            "--info-foreground",     "--info",             4.5),
    # UI boundaries only need 3.0
    ("focus ring on page",           "--ring",                "--background",       3.0),
    ("focus ring on card",           "--ring",                "--card",             3.0),
    ("chart 2 on card",              "--chart-2",             "--card",             3.0),
    ("chart 3 on card",              "--chart-3",             "--card",             3.0),
    ("chart 4 on card",              "--chart-4",             "--card",             3.0),
    ("chart 5 on card",              "--chart-5",             "--card",             3.0),
]


def main():
    scopes = parse_blocks(CSS.read_text())
    failures = []

    for scope in ("light", "dark"):
        tokens = scopes[scope]
        # Dark inherits any token it does not redefine.
        merged = {**scopes["light"], **tokens} if scope == "dark" else tokens

        print(f"\n{scope.upper()} THEME")
        print("-" * 62)

        for label, fg_name, bg_name, required in PAIRS:
            fg = resolve(merged, fg_name)
            bg = resolve(merged, bg_name)

            if fg is None or bg is None:
                print(f"  {label:<30} SKIP (unresolved token)")
                continue

            bg_rgb, bg_alpha = bg
            page = resolve(merged, "--background")[0]
            if bg_alpha < 1:
                bg_rgb = composite(bg_rgb, bg_alpha, page)

            fg_rgb, fg_alpha = fg
            if fg_alpha < 1:
                fg_rgb = composite(fg_rgb, fg_alpha, bg_rgb)

            ratio = contrast(fg_rgb, bg_rgb)
            ok = ratio >= required
            mark = "PASS" if ok else "FAIL"
            print(f"  {label:<30} {ratio:5.2f}:1  needs {required}  {mark}")

            if not ok:
                failures.append((scope, label, round(ratio, 2), required))

    print("\n" + "=" * 62)
    if failures:
        print(f"{len(failures)} pair(s) below the WCAG AA threshold:\n")
        for scope, label, ratio, required in failures:
            print(f"  [{scope}] {label}: {ratio}:1 (needs {required}:1)")
        sys.exit(1)

    print("All token pairs meet WCAG AA.")


if __name__ == "__main__":
    main()

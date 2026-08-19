from pathlib import Path

p = Path(__file__).parent / "app" / "ml" / "predictor.py"
text = p.read_text(encoding="utf-8")
broken = "include=[np.number" + chr(34) + "]"
fixed = "include=[np.number]"
if broken in text:
    p.write_text(text.replace(broken, fixed), encoding="utf-8")
    print("fixed quote")
else:
    print("pattern not found")
    for i, line in enumerate(text.splitlines(), 1):
        if "num_cols" in line:
            print(i, repr(line))

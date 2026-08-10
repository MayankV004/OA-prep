import os, re, json

patterns_dir = "content/patterns"
out_dir = "data/patterns"
os.makedirs(out_dir, exist_ok=True)

files = [f for f in os.listdir(patterns_dir) if f.endswith('.mdx')]
index_exports = []

for file in files:
    slug = file.replace('.mdx', '')
    with open(os.path.join(patterns_dir, file), 'r') as f:
        content = f.read()

    meta_match = re.search(r'export const metadata = (\{.*?\});', content, re.DOTALL)
    if not meta_match: continue
    
    meta_str = meta_match.group(1)
    def get_val(key):
        m = re.search(f"{key}:\\s*'([^']+)'", meta_str)
        return m.group(1) if m else ""

    title = get_val('title')
    description = get_val('description')
    timeComplexity = get_val('timeComplexity')
    spaceComplexity = get_val('spaceComplexity')
    
    use_cases_match = re.search(r"useCases:\s*\[(.*?)\]", meta_str, re.DOTALL)
    use_cases = [v.strip().strip("'").strip('"') for v in use_cases_match.group(1).split(',')] if use_cases_match else []
    use_cases = [u for u in use_cases if u]

    var_meta_match = re.search(r"variations:\s*\[(.*?)\]\s*\}", meta_str, re.DOTALL)
    var_meta = []
    if var_meta_match:
        for v in re.finditer(r"\{\s*id:\s*'([^']+)',\s*title:\s*'([^']+)',\s*description:\s*'([^']+)'\s*\}", var_meta_match.group(1)):
            var_meta.append({"id": v.group(1), "title": v.group(2), "description": v.group(3)})
    
    concept_match = re.search(r'## Concept\n+(.*?)(?=## Template)', content, re.DOTALL)
    concept = concept_match.group(1).strip() if concept_match else ""

    when_match = re.search(r'## When to Use\n+(.*?)(?=## |\Z)', content, re.DOTALL)
    explanation = when_match.group(1).strip() if when_match else ""

    templates_str = ""
    template_match = re.search(r'## Template\n+(.*?)(?=## When to Use)', content, re.DOTALL)
    if template_match:
        templates_str = template_match.group(1)
    
    sections = re.split(r'### ', templates_str)
    
    base_template = ""
    if len(sections) > 1:
        base_code_match = re.search(r'```(?:java|python)\n(.*?)```', sections[1], re.DOTALL)
        if base_code_match: base_template = base_code_match.group(1).strip()
    elif len(sections) == 1:
        base_code_match = re.search(r'```(?:java|python)\n(.*?)```', sections[0], re.DOTALL)
        if base_code_match: base_template = base_code_match.group(1).strip()

    variations_data = []
    # If the number of variations matches the number of sections (minus the general one or plus one),
    # we can map them sequentially. Usually section[1] is base template, section[2] is var1, etc.
    code_blocks = re.findall(r'```(?:java|python)\n(.*?)```', templates_str, re.DOTALL)
    
    # We will try mapping sequentially, skipping the first if len(code_blocks) > len(var_meta)
    if len(code_blocks) > len(var_meta):
        codes_for_vars = code_blocks[-len(var_meta):]
    else:
        codes_for_vars = code_blocks + [""] * (len(var_meta) - len(code_blocks))
        
    for i, vm in enumerate(var_meta):
        code = codes_for_vars[i].strip() if i < len(codes_for_vars) else ""
        if not code: code = base_template
        variations_data.append({
            "id": vm['id'],
            "title": vm['title'],
            "concept": vm['description'],
            "templateCode": code
        })
    
    ts_code = f"""import {{ PatternData }} from '@/types/pattern';

export const {slug.replace('-', '_')}: PatternData = {{
  slug: '{slug}',
  title: {json.dumps(title)},
  description: {json.dumps(description)},
  timeComplexity: {json.dumps(timeComplexity)},
  spaceComplexity: {json.dumps(spaceComplexity)},
  useCases: {json.dumps(use_cases)},
  concept: {json.dumps(concept)},
  templateCode: {json.dumps(base_template)},
  explanation: {json.dumps(explanation)},
  variations: {json.dumps(variations_data, indent=2)}
}};
"""
    with open(os.path.join(out_dir, f"{slug}.ts"), "w") as out_f:
        out_f.write(ts_code)
    
    index_exports.append(f"export * from './{slug}';")

with open(os.path.join(out_dir, "index.ts"), "w") as out_f:
    out_f.write("\n".join(index_exports))
    out_f.write("\n")

print("Done")

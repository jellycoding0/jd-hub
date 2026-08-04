import os
import re

def list_hw_tags():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    hw_files = []
    
    for root, dirs, files in os.walk(base_dir):
        for file_name in files:
            if file_name.endswith('.md'):
                file_path = os.path.join(root, file_name)
                try:
                    with open(file_path, 'r', encoding='utf-8-sig') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    with open(file_path, 'r', encoding='cp949') as f:
                        content = f.read()
                
                frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if frontmatter_match:
                    tag_lines = re.findall(r'-\s*(.*)', frontmatter_match.group(1))
                    tags = [t.strip() for t in tag_lines if t.strip()]
                    
                    for t in tags:
                        if t in ["hw_기구", "hw_전장", "hardware"]:
                            hw_files.append((file_name, t, file_path))
                            break

    print("=== CURRENT HW TAGS ===")
    for idx, (fn, tag, fp) in enumerate(hw_files):
        # Safely print Korean text by keeping unicode in python, print will work fine if we don't encode/decode raw bytes
        print(f"{idx+1}. Tag: {tag} | File: {fn}")

if __name__ == "__main__":
    list_hw_tags()

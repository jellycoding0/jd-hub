import os
import re

def make_hw_report():
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
                            parent_folder = os.path.basename(root)
                            hw_files.append((parent_folder, file_name, t, file_path))
                            break

    output_report = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/scratch/hw_tags_report.txt"
    
    with open(output_report, 'w', encoding='utf-8') as f:
        f.write("=== CURRENT HW TAGS REPORT ===\n")
        for idx, (folder, fn, tag, fp) in enumerate(hw_files):
            f.write(f"{idx+1}. Folder: {folder} | Tag: {tag} | File: {fn}\n")
            
    print("Report written successfully to scratch/hw_tags_report.txt!")

if __name__ == "__main__":
    make_hw_report()

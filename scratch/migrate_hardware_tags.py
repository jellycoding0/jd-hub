import os
import re

def migrate_hardware_and_rename_tags():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    # Keyword classification patterns
    electrical_keywords = ["전장", "회로", "pcb", "electrical", "하네스", "harness", "센서"]
    mechanical_keywords = ["기구", "설계", "mechanical", "cad", "구조", "디자인", "핸드", "오퍼레이터"]
    
    count_files = 0
    
    # Walk through all directories
    for root, dirs, files in os.walk(base_dir):
        for file_name in files:
            if file_name.endswith('.md'):
                file_path = os.path.join(root, file_name)
                
                # Read content safely
                try:
                    with open(file_path, 'r', encoding='utf-8-sig') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    with open(file_path, 'r', encoding='cp949') as f:
                        content = f.read()
                
                # Check if it has yaml frontmatter
                frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter_text = frontmatter_match.group(1)
                    body_content = content[frontmatter_match.end():]
                    
                    # Parse current tags
                    tag_lines = re.findall(r'-\s*(.*)', frontmatter_text)
                    tags = [t.strip().lower() for t in tag_lines if t.strip()]
                    
                    # If "hardware" is in tags, we must migrate it to "hw_전장" or "hw_기구"
                    if "hardware" in tags:
                        # Determine if it's electrical or mechanical
                        search_target = (file_name + " " + body_content).lower()
                        
                        is_electrical = any(kw in search_target for kw in electrical_keywords)
                        is_mechanical = any(kw in search_target for kw in mechanical_keywords)
                        
                        new_tag = "hw_기구" # fallback default
                        if is_electrical and not is_mechanical:
                            new_tag = "hw_전장"
                        elif is_mechanical:
                            new_tag = "hw_기구"
                        elif "전장" in file_name or "회로" in file_name:
                            new_tag = "hw_전장"
                            
                        # Replace "hardware" with new specific tag
                        tags = [new_tag if t == "hardware" else t for t in tags]
                        
                        # Reconstruct frontmatter
                        new_frontmatter = "---\ntags:\n"
                        for t in tags:
                            new_frontmatter += f"  - {t}\n"
                        new_frontmatter += "---\n"
                        
                        final_content = new_frontmatter + body_content
                        
                        # Write back cleanly
                        with open(file_path, 'w', encoding='utf-8-sig') as f:
                            f.write(final_content)
                            
                        count_files += 1
                        print(f"Migrated hardware tag in safely: {file_name.encode('ascii', 'ignore').decode('ascii')} -> {new_tag}")
                        
    print(f"\nTotal hardware tags migrated: {count_files} files.")

if __name__ == "__main__":
    migrate_hardware_and_rename_tags()

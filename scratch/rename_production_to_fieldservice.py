import os
import re

def rename_tag_production_to_fieldservice():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    count_files = 0
    
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
                
                # Check yaml frontmatter
                frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter_text = frontmatter_match.group(1)
                    body_content = content[frontmatter_match.end():]
                    
                    tag_lines = re.findall(r'-\s*(.*)', frontmatter_text)
                    tags = [t.strip() for t in tag_lines if t.strip()]
                    
                    # If "생산" is in tags, rename it to "필드서비스"
                    if "생산" in tags:
                        tags = ["필드서비스" if t == "생산" else t for t in tags]
                        
                        # Reconstruct frontmatter
                        new_frontmatter = "---\ntags:\n"
                        for t in tags:
                            new_frontmatter += f"  - {t}\n"
                        new_frontmatter += "---\n"
                        
                        final_content = new_frontmatter + body_content
                        
                        with open(file_path, 'w', encoding='utf-8-sig') as f:
                            f.write(final_content)
                            
                        count_files += 1
                        print(f"Renamed 생산 tag to 필드서비스 in: {file_name.encode('ascii', 'ignore').decode('ascii')}")
                        
    print(f"\nSuccessfully migrated {count_files} files to 필드서비스 tag.")

if __name__ == "__main__":
    rename_tag_production_to_fieldservice()

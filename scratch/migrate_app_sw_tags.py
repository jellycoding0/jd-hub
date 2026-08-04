import os
import re

def migrate_app_sw():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    app_sw_keywords = ["backend", "frontend", "web", "gui", "ui", "클라우드", "백엔드", "웹", "관제", "app", "애플리케이션"]
    
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
                
                # Check if it has yaml frontmatter
                frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter_text = frontmatter_match.group(1)
                    body_content = content[frontmatter_match.end():]
                    
                    # Parse tags
                    tag_lines = re.findall(r'-\s*(.*)', frontmatter_text)
                    tags = [t.strip().lower() for t in tag_lines if t.strip()]
                    
                    # Search text for app_sw indicators
                    search_target = (file_name + " " + body_content).lower()
                    
                    is_app_sw = any(kw in search_target for kw in app_sw_keywords)
                    
                    # We only convert if it has generic "prod_기획" or other soft tags, or if it explicitly belongs to Web/Backend development
                    # For example, "FigureAI_2600_Backend Engineer.md" or "현차_2410_WEB Front-End 개발.md"
                    if is_app_sw and ("embedded" in tags or "prod_기획" in tags or "product" in tags):
                        # Ensure we don't convert pure embedded firmware engineering
                        if "firmware" in search_target or "mcu" in search_target or "dsp" in search_target or "임베디드" in file_name:
                            continue
                            
                        # Perform translation: swap "prod_기획" or "embedded" with "app_sw"
                        new_tags = []
                        for t in tags:
                            if t in ["prod_기획", "embedded", "product"]:
                                new_tags.append("app_sw")
                            else:
                                new_tags.append(t)
                                
                        # Remove duplicates
                        new_tags = list(set(new_tags))
                        
                        # Reconstruct frontmatter
                        new_frontmatter = "---\ntags:\n"
                        for t in new_tags:
                            new_frontmatter += f"  - {t}\n"
                        new_frontmatter += "---\n"
                        
                        final_content = new_frontmatter + body_content
                        
                        with open(file_path, 'w', encoding='utf-8-sig') as f:
                            f.write(final_content)
                            
                        count_files += 1
                        print(f"Migrated to app_sw safely: {file_name.encode('ascii', 'ignore').decode('ascii')} -> {new_tags}")
                        
    print(f"\nTotal app_sw tags migrated: {count_files} files.")

if __name__ == "__main__":
    migrate_app_sw()

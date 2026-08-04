import os
import re

def translate_md_tags_to_korean():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    translation_map = {
        "ai": "AI",
        "control": "제어",
        "embedded": "임베디드SW",
        "app_sw": "어플리케이션SW",
        "hw_전장": "HW전장",
        "hw_기구": "HW기구",
        "autonomous-driving": "자율주행",
        "autonomous_driving": "자율주행",
        "prod_생산": "생산",
        "prod_품질": "품질",
        "prod_영업": "영업",
        "prod_기획": "기획",
        "prod_시험": "시험",
        "prod_인증": "인증",
        "product": "기획"
    }
    
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
                
                # Parse frontmatter
                frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter_text = frontmatter_match.group(1)
                    body_content = content[frontmatter_match.end():]
                    
                    # Parse tags
                    tag_lines = re.findall(r'-\s*(.*)', frontmatter_text)
                    tags = [t.strip().lower() for t in tag_lines if t.strip()]
                    
                    # Map tags to Korean equivalents
                    new_tags = []
                    modified = False
                    for t in tags:
                        if t in translation_map:
                            new_tags.append(translation_map[t])
                            modified = True
                        else:
                            # Keep company names or original tags if they don't match (though company names are normally empty now)
                            new_tags.append(t)
                    
                    if modified:
                        # Reconstruct frontmatter with pure Korean/Capital tags
                        new_frontmatter = "---\ntags:\n"
                        for nt in new_tags:
                            # Safely write Korean tags
                            new_frontmatter += f"  - {nt}\n"
                        new_frontmatter += "---\n"
                        
                        final_content = new_frontmatter + body_content
                        
                        with open(file_path, 'w', encoding='utf-8-sig') as f:
                            f.write(final_content)
                            
                        count_files += 1
                        
    print(f"Successfully migrated {count_files} files to clean Korean/Capital tags!")

if __name__ == "__main__":
    translate_md_tags_to_korean()

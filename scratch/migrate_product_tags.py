import os
import re

def migrate_product_tags():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    # Keyword classification definitions
    classification_rules = {
        "prod_품질": ["품질", "qa", "qe", "quality", "검증"],
        "prod_생산": ["생산", "제조", "양산", "조립", "오퍼레이터", "manufacturing", "assembly", "factory", "공장"],
        "prod_영업": ["영업", "사업", "sales", "마케팅", "marketing", "비즈니스", "business"],
        "prod_기획": ["기획", "pm", "po", "전략", "strategy", "management"],
        "prod_시험": ["시험", "평가", "test", "validation", "실험"],
        "prod_인증": ["인증", "규격", "certification", "compliance", "표준"]
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
                
                # Check yaml frontmatter
                frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if frontmatter_match:
                    frontmatter_text = frontmatter_match.group(1)
                    body_content = content[frontmatter_match.end():]
                    
                    # Parse current tags
                    tag_lines = re.findall(r'-\s*(.*)', frontmatter_text)
                    tags = [t.strip().lower() for t in tag_lines if t.strip()]
                    
                    # If "product" is in tags, migrate to subdivided tags
                    if "product" in tags:
                        search_target = (file_name + " " + body_content).lower()
                        
                        matched_tag = "prod_기획" # fallback default
                        found = False
                        
                        # Match priority based on rule keywords
                        for target_tag, keywords in classification_rules.items():
                            if any(kw in search_target for kw in keywords):
                                matched_tag = target_tag
                                found = True
                                break
                                
                        # Replace product with matched_tag
                        tags = [matched_tag if t == "product" else t for t in tags]
                        
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
                        print(f"Migrated product tag safely: {file_name.encode('ascii', 'ignore').decode('ascii')} -> {matched_tag}")
                        
    print(f"\nTotal product tags migrated: {count_files} files.")

if __name__ == "__main__":
    migrate_product_tags()

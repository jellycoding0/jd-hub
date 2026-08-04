import os
import re

def format_wi_jds():
    folder_path = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_/스타트업"
    
    # Mapping filename keywords to relevant tags (max 2 tags)
    tag_mapping = {
        "Inference System": ["ai", "embedded"],
        "Robot Learning": ["ai", "control"],
        "설계": ["hardware"],
        "소프트웨어": ["embedded", "product"],
        "제어": ["control"],
        "전장": ["hardware", "embedded"]
    }
    
    for file_name in os.listdir(folder_path):
        if file_name.startswith("위로보틱스_2608_") and file_name.endswith(".md"):
            file_path = os.path.join(folder_path, file_name)
            
            # Read current content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Determine tags based on filename
            assigned_tags = ["embedded"] # default fallback
            for keyword, tags in tag_mapping.items():
                if keyword in file_name:
                    assigned_tags = tags
                    break
                    
            # 1. Clean up frontmatter if somehow already existing, otherwise start fresh
            if content.startswith("---"):
                # strip existing frontmatter
                match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if match:
                    content = content[match.end():]
                    
            # Remove any leading/trailing blank spaces or duplicated startings
            content = content.strip()
            
            # 2. Add H2 prefix for main sections if they are raw text
            sections = ["포지션 상세", "주요업무", "자격요건", "우대사항", "혜택 및 복지", "혜택및복지"]
            for sec in sections:
                # Matches the section name when it's on a line by itself, not already having '#'
                pattern = r'(?m)^' + re.escape(sec) + r'\s*$'
                replacement = "## " + sec
                content = re.sub(pattern, replacement, content)
            
            # Unify "혜택및복지" to "혜택 및 복지"
            content = content.replace("## 혜택및복지", "## 혜택 및 복지")
            
            # 3. Add standard 수강생 준비 포인트 section at the bottom if not present
            if "수강생 준비 포인트" not in content:
                content += "\n\n## 수강생 준비 포인트\n- "
                
            # 4. Construct final structured content with YAML frontmatter
            frontmatter = "---\ntags:\n"
            for t in assigned_tags:
                frontmatter += f"  - {t}\n"
            frontmatter += "---\n\n"
            
            final_content = frontmatter + content
            
            # Write back cleanly in UTF-8-sig
            with open(file_path, 'w', encoding='utf-8-sig') as f:
                f.write(final_content)
                
            print(f"Formated and updated WIRobotics JD: {file_name}")

if __name__ == "__main__":
    format_wi_jds()

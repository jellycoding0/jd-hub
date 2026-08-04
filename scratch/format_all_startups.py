import os
import re

def format_all_startups():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    folders = ["에이딘로보틱스", "엔젤로보틱스", "위로보틱스", "홀리데이로보틱스"]
    
    # Precise tag mapping rules based on job title keywords
    tag_mapping = {
        "Inference System": ["ai", "embedded"],
        "Robot Learning": ["ai", "control"],
        "학습 기반 제어": ["control", "ai"],
        "사족보행": ["control", "embedded"],
        "기구 설계": ["hardware"],
        "CAD,설계": ["hardware"],
        "제어": ["control"],
        "설계": ["hardware"],
        "소프트웨어": ["embedded", "product"],
        "전장": ["hardware", "embedded"],
        "Firmware": ["embedded"],
        "Quality Assurance": ["product"],
        "Quality Evaluation": ["product"],
        "QE": ["product"],
        "테스트,제조": ["product", "embedded"],
        "Forward Deployed": ["product", "embedded"],
        "조립 오퍼레이터": ["hardware", "product"],
        "Field Service": ["product"]
    }
    
    for folder in folders:
        folder_path = os.path.join(base_dir, folder)
        if not os.path.exists(folder_path):
            print(f"Skipping non-existing folder: {folder}")
            continue
            
        for file_name in os.listdir(folder_path):
            if file_name.endswith('.md'):
                file_path = os.path.join(folder_path, file_name)
                
                # Read content safely
                try:
                    with open(file_path, 'r', encoding='utf-8-sig') as f:
                        content = f.read()
                except UnicodeDecodeError:
                    with open(file_path, 'r', encoding='cp949') as f:
                        content = f.read()
                
                is_intro = "소개" in file_name
                
                # 1. Clean existing frontmatter if present
                if content.strip().startswith("---"):
                    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                    if match:
                        content = content[match.end():]
                
                content = content.strip()
                
                # 2. Determine Tags
                assigned_tags = []
                if is_intro:
                    assigned_tags = [folder, "기업소개"]
                else:
                    # Search keyword for tag mapping
                    matched = False
                    for kw, tags in tag_mapping.items():
                        if kw.lower() in file_name.lower():
                            assigned_tags = tags
                            matched = True
                            break
                    if not matched:
                        # Fallback based on content keywords
                        if "ai" in content.lower():
                            assigned_tags = ["ai"]
                        elif "control" in file_name.lower() or "제어" in file_name:
                            assigned_tags = ["control"]
                        elif "하드웨어" in file_name or "hw" in file_name.lower():
                            assigned_tags = ["hardware"]
                        else:
                            assigned_tags = ["product"]
                
                # 3. Clean up raw content (H2 mapping)
                if not is_intro:
                    sections = ["포지션 상세", "주요업무", "자격요건", "우대사항", "혜택 및 복지", "혜택및복지", "복리후생", "전형절차", "전형 단계"]
                    for sec in sections:
                        pattern = r'(?m)^' + re.escape(sec) + r'\s*$'
                        content = re.sub(pattern, "## " + sec, content)
                    content = content.replace("## 혜택및복지", "## 혜택 및 복지")
                    
                    # Remove any duplicate H1 titles at the very first line if present
                    lines = content.split('\n')
                    if lines and lines[0].strip().startswith('# '):
                        lines.pop(0)
                        content = '\n'.join(lines).strip()
                    
                    # Ensure 수강생 준비 포인트 exists
                    if "수강생 준비 포인트" not in content:
                        content += "\n\n## 수강생 준비 포인트\n- "
                
                # 4. Construct final content with clean Frontmatter
                frontmatter = "---\ntags:\n"
                for t in assigned_tags:
                    frontmatter += f"  - {t}\n"
                frontmatter += "---\n\n"
                
                final_content = frontmatter + content
                
                # Write back as clean utf-8-sig
                with open(file_path, 'w', encoding='utf-8-sig') as f:
                    f.write(final_content)
                
                print(f"[{folder}] Formatted file: {file_name}")

if __name__ == "__main__":
    format_all_startups()

import os
import re

TAG_KEYWORDS = {
    'ai': ['ai', '인공지능', 'deep learning', 'machine learning', 'ml', '딥러닝', '학습', '강화학습', 'reinforcement'],
    'control': ['제어', '모션', 'control', 'motion', '진동', '동역학', '기구학', '플래닝', 'planning', '궤적', '제어기', '제어 알고리즘'],
    'embedded': ['임베디드', 'embedded', 'firmware', '펌웨어', 'rtos', 'mcu', 'dsp', 'c++', 'c언어', '드라이버', 'hal', '보드', 'linux', '리눅스'],
    'hardware': ['기구', 'mechanical', '설계', 'cad', 'solidworks', 'catia', '해석', 'fem', '전장', 'pcb', '회로', '하네스', 'structural', '부품'],
    'autonomous-driving': ['자율주행', 'slam', 'localization', 'navigation', '네비게이션', '지도', 'lidar', 'perception', '인지', '카메라']
}

def format_doosan_content(content):
    # Normalize carriage returns
    text = content.replace('\r\n', '\n')
    
    # 1. Format Headers
    replacements = [
        (r'\[?직무\s*개요\]?', '## 직무 개요'),
        (r'\[?공고\s*기준\]?', '## 공고 기준'),
        (r'\[(?:이런\s+)?일을\s*(?:수행)?해요\]', '## 주요 업무'),
        (r'\[주요\s*업무\]', '## 주요 업무'),
        (r'\[(?:이런\s+)?경험을\s+가진\s+분을\s+찾아요\]', '## 요구 역량'),
        (r'\[자격\s*요건\]', '## 요구 역량'),
        (r'\[지원\s*자격\]', '## 요구 역량'),
        (r'\[요구\s*역량\]', '## 요구 역량'),
        (r'\[자격요건\]', '## 요구 역량'),
        (r'\[(?:이런\s+)?경험이\s+있으시면\s+더\s+좋아요!?\]', '## 우대 사항'),
        (r'\[우대\s*사항\]', '## 우대 사항'),
        (r'\[우대사항\]', '## 우대 사항'),
        (r'\[?수강생\s*준비\s*포인트\]?', '## 수강생 준비 포인트')
    ]
    
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
    # Standardize spaces around H2 headers
    text = re.sub(r'\n*##\s*(.*?)\n+', r'\n\n## \1\n', text)
    
    # 2. Tag Auto-Analysis
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', text, re.DOTALL)
    body_for_tagging = text
    existing_tags = []
    
    if frontmatter_match:
        frontmatter_text = frontmatter_match.group(1)
        body_for_tagging = text[frontmatter_match.end():]
        tag_lines = re.findall(r'-\s*(.*)', frontmatter_text)
        existing_tags = [t.strip() for t in tag_lines if t.strip()]
        
    lower_body = body_for_tagging.lower()
    auto_tags = []
    for tag, keywords in TAG_KEYWORDS.items():
        if tag not in existing_tags:
            for kw in keywords:
                if kw in lower_body:
                    auto_tags.append(tag)
                    break
                    
    all_tags = existing_tags + auto_tags
    # Fallback to control if no tags identified
    if not all_tags:
        all_tags = ['control']
        
    # Rebuild cleanly
    clean_body = text
    if frontmatter_match:
        clean_body = text[frontmatter_match.end():].strip()
    else:
        clean_body = text.strip()
        
    yaml_tags = "\n".join(f"  - {t}" for t in all_tags)
    new_content = f"---\ntags:\n{yaml_tags}\n---\n\n{clean_body}"
    
    return new_content

def process_doosan_files():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_/두산로보틱스"
    
    count = 0
    for file in os.listdir(base_dir):
        if file.endswith('.md') and not file.startswith('_'): # Skip company intro _두산로보틱스_소개.md
            file_path = os.path.join(base_dir, file)
            
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                content = f.read()
                
            formatted = format_doosan_content(content)
            
            if formatted.strip() != content.strip():
                with open(file_path, 'w', encoding='utf-8-sig') as f:
                    f.write(formatted.strip() + '\n')
                count += 1
                
    print(f"\nSuccessfully cleaned format and auto-tagged {count} files in 두산로보틱스!")

if __name__ == "__main__":
    process_doosan_files()

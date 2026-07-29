import os
import re

def clean_carriage_returns(text):
    return text.replace('\r\n', '\n')

def format_content(content):
    text = clean_carriage_returns(content)
    
    # Define replace rules for headers (using regex for flexibility)
    replacements = [
        # Job description / Overview
        (r'\[?직무\s*개요\]?', '## 직무 개요'),
        (r'\[?공고\s*기준\]?', '## 공고 기준'),
        
        # Duties / Tasks
        (r'\[(?:이런\s+)?일을\s*(?:수행)?해요\]', '## 주요 업무'),
        (r'\[주요\s*업무\]', '## 주요 업무'),
        
        # Requirements / Skills
        (r'\[(?:이런\s+)?경험을\s+가진\s+분을\s+찾아요\]', '## 요구 역량'),
        (r'\[자격\s*요건\]', '## 요구 역량'),
        (r'\[지원\s*자격\]', '## 요구 역량'),
        (r'\[요구\s*역량\]', '## 요구 역량'),
        (r'\[자격요건\]', '## 요구 역량'),
        
        # Preferences / Nice to haves
        (r'\[(?:이런\s+)?경험이\s+있으시면\s+더\s+좋아요!?\]', '## 우대 사항'),
        (r'\[우대\s*사항\]', '## 우대 사항'),
        (r'\[우대사항\]', '## 우대 사항'),
        
        # Private Notes
        (r'\[?수강생\s*준비\s*포인트\]?', '## 수강생 준비 포인트')
    ]
    
    for pattern, replacement in replacements:
        text = re.search(pattern, text) and re.sub(pattern, replacement, text, flags=re.IGNORECASE) or text
        
    # Standardize spaces and lines around H2 headers
    # Ensure there is exactly one empty line before ##, and a single newline after it.
    text = re.sub(r'\n*##\s*(.*?)\n+', r'\n\n## \1\n', text)
    
    return text

def format_all_files():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md') and not file.startswith('_'): # Skip company intro files starting with _
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8-sig') as f:
                    content = f.read()
                
                formatted = format_content(content)
                
                # Check if file content actually changed
                if formatted != content:
                    with open(file_path, 'w', encoding='utf-8-sig') as f:
                        f.write(formatted.strip() + '\n')
                    # Commented out print to avoid encoding errors on windows terminal
                    # print(f"Formatted: {file}")
                    count += 1
                    
    print(f"\nSuccessfully formatted {count} raw markdown files to standard style (Option A)!")

if __name__ == "__main__":
    format_all_files()

import os
import re

def format_intro_file(file_path):
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
    
    content = content.replace('\r\n', '\n')
    
    # We target "## 참고" section
    if "## 참고" in content:
        parts = content.split("## 참고")
        before_ref = parts[0]
        ref_section = parts[1]
        
        # Check if there is another H2 section after "## 참고"
        next_sec_match = re.search(r'\n##\s', ref_section)
        if next_sec_match:
            ref_text = ref_section[:next_sec_match.start()]
            after_ref = ref_section[next_sec_match.start():]
        else:
            ref_text = ref_section
            after_ref = ""
            
        # Format the lines in the "## 참고" section
        lines = ref_text.split('\n')
        formatted_lines = []
        for line in lines:
            stripped = line.strip()
            # If line is regular text (doesn't start with Markdown markers), prepend "- "
            if stripped and not stripped.startswith('-') and not stripped.startswith('*') and not stripped.startswith('#'):
                formatted_lines.append(f"- {stripped}")
            else:
                formatted_lines.append(line)
        
        new_ref_section = '\n'.join(formatted_lines)
        new_content = before_ref + "## 참고" + new_ref_section + after_ref
        
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8-sig') as f:
                f.write(new_content.strip() + '\n')
            return True
            
    return False

def format_all_intros():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md') and "소개" in file:
                file_path = os.path.join(root, file)
                try:
                    if format_intro_file(file_path):
                        count += 1
                except Exception as e:
                    # Skip files with errors
                    pass
                    
    print(f"\nSuccessfully formatted {count} company introduction files!")

if __name__ == "__main__":
    format_all_intros()

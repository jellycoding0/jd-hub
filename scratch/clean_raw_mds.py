import os
import re

def clean_markdown_files():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                
                # Read original content
                with open(file_path, 'r', encoding='utf-8-sig') as f:
                    content = f.read()
                
                # Check if the private section exists
                if "수강생 준비 포인트" in content:
                    # Clean Windows carriage returns to \n for stable regex
                    cleaned_content = content.replace('\r\n', '\n')
                    
                    # Regex to remove "수강생 준비 포인트" section
                    cleaned_content = re.sub(
                        r'(?:\n##\s*|\n###\s*|\n)?수강생 준비 포인트.*?(?=\n##|\n###|\Z)', 
                        '', 
                        cleaned_content, 
                        flags=re.DOTALL | re.IGNORECASE
                    )
                    
                    # Restore standard carriage returns if wanted, or write back clean \n
                    # Writing back as utf-8-sig to preserve BOM if it was there
                    with open(file_path, 'w', encoding='utf-8-sig') as f:
                        f.write(cleaned_content.strip() + '\n')
                    
                    print(f"Cleaned raw MD: {file}")
                    count += 1
                    
    print(f"\nCompleted! Cleaned '수강생 준비 포인트' from {count} raw markdown files.")

if __name__ == "__main__":
    clean_markdown_files()

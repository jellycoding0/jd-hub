import os
import re

def fix_nested_hashes():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                
                with open(file_path, 'r', encoding='utf-8-sig') as f:
                    content = f.read()
                
                # Replace multiple hash marks (e.g. ## ## ## or ## ##) with a single ##
                # Matches one or more repetitions of hash sequences
                fixed = re.sub(r'(?:#+\s*){2,}', '## ', content)
                
                # Standardize spacing around the H2 header
                fixed = fixed.replace('\r\n', '\n')
                fixed = re.sub(r'\n*##\s*(.*?)\n+', r'\n\n## \1\n', fixed)
                
                if fixed != content:
                    with open(file_path, 'w', encoding='utf-8-sig') as f:
                        f.write(fixed.strip() + '\n')
                    # Commented out print to avoid encoding errors on windows terminal
                    # print(f"Fixed: {file}")
                    count += 1
                    
    print(f"\nSuccessfully cleaned and restored {count} files with redundant hash marks!")

if __name__ == "__main__":
    fix_nested_hashes()

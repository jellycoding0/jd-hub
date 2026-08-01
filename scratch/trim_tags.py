import os
import re

def trim_tags_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8-sig') as f:
        content = f.read()
        
    content = content.replace('\r\n', '\n')
    
    frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if frontmatter_match:
        frontmatter_text = frontmatter_match.group(1)
        body = content[frontmatter_match.end():]
        
        # Parse existing tags and other frontmatter variables
        lines = frontmatter_text.split('\n')
        tags = []
        other_lines = []
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
            
            tag_match = re.match(r'^-\s*(.*)', stripped)
            if tag_match:
                tags.append(tag_match.group(1).strip())
            elif not stripped.startswith('tags:'):
                other_lines.append(line)
                
        # If tags exceed 2, trim it to first 2 tags
        if len(tags) > 2:
            trimmed_tags = tags[:2]
            
            # Reconstruct frontmatter
            new_fm_lines = ["tags:"]
            for t in trimmed_tags:
                new_fm_lines.append(f"  - {t}")
            for l in other_lines:
                new_fm_lines.append(l)
                
            new_frontmatter = "\n".join(new_fm_lines)
            new_content = f"---\n{new_frontmatter}\n---\n{body}"
            
            with open(file_path, 'w', encoding='utf-8-sig') as f:
                f.write(new_content.strip() + '\n')
            return True
            
    return False

def trim_all_files():
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    count = 0
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.md'):
                file_path = os.path.join(root, file)
                try:
                    if trim_tags_in_file(file_path):
                        count += 1
                except Exception as e:
                    pass
                    
    print(f"\nSuccessfully trimmed tags in {count} markdown files to max 2 tags!")

if __name__ == "__main__":
    trim_all_files()

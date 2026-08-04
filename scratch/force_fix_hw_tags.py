import os
import re

def force_fix_hw_tags():
    # Absolute paths and target clean tags for the 11 misclassified files
    corrections = {
        "Figure AI/FigureAI_2600_Power Electronics Engineer, Charging.md": ["hw_전장"],
        "HD현대로보틱스/HD현대_2502_로봇시스템 전장 HW.md": ["hw_전장"],
        "HD현대로보틱스/HD현대_2502_자동화솔루션 전장 제어 설계.md": ["hw_전장", "control"],
        "HD현대로보틱스/HD현대_2502_하네스 설계.md": ["hw_전장"],
        "두산로보틱스/두산_2608_로봇 임베디드 SW 개발자.md": ["embedded"],
        "두산로보틱스/두산_2608_로봇 프레임워크 개발자(Linux).md": ["embedded"],
        "삼성전자_미로추/삼전_2505_서보 모터 드라이버 회로 설계​.md": ["hw_전장"],
        "위로보틱스/위로보틱스_2608_휴머노이드 전장 하드웨어 엔지니어.md": ["hw_전장", "embedded"],
        "한화로보틱스/한화_2506_모바일 로봇 전장 HW 개발.md": ["hw_전장"],
        "현차_로보틱스랩/현차_2608_모바일로봇_임베디드직무_글로벌 채용전환형 인턴십.md": ["embedded"],
        "홀리데이로보틱스/홀리데이로보틱스_2608_전장,회로 양산개발 엔지니어.md": ["hw_전장", "embedded"]
    }
    
    base_dir = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_"
    
    for rel_path, correct_tags in corrections.items():
        # Handle zero-width spaces or potential hidden chars in local paths by searching files
        dir_part, file_part = rel_path.split('/')
        target_dir = os.path.join(base_dir, dir_part)
        
        if not os.path.exists(target_dir):
            print(f"Skipping directory: {target_dir}")
            continue
            
        # Locate exact file by stripping name characters for comparison
        clean_file_part = file_part.replace('\u200b', '').strip().lower()
        matched_file = None
        
        for fn in os.listdir(target_dir):
            clean_fn = fn.replace('\u200b', '').strip().lower()
            if clean_fn == clean_file_part:
                matched_file = fn
                break
                
        if matched_file:
            file_path = os.path.join(target_dir, matched_file)
            
            # Read content
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                content = f.read()
                
            # Strip current frontmatter
            frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
            body_content = content
            if frontmatter_match:
                body_content = content[frontmatter_match.end():]
                
            # Reconstruct clean frontmatter
            new_frontmatter = "---\ntags:\n"
            for t in correct_tags:
                new_frontmatter += f"  - {t}\n"
            new_frontmatter += "---\n\n"
            
            final_content = new_frontmatter + body_content.strip()
            
            # Save back cleanly
            with open(file_path, 'w', encoding='utf-8-sig') as f:
                f.write(final_content)
                
            try:
                print(f"Successfully corrected tags for: {matched_file.encode('ascii', 'ignore').decode('ascii')} -> {correct_tags}")
            except Exception:
                pass
        else:
            print(f"WARNING: Could not find exact file on disk: {file_part}")

if __name__ == "__main__":
    force_fix_hw_tags()

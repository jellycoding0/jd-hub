file_path = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/docs/jobs.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

patched = content.replace("인프런 바로가기", "바로가기 링크").replace("코멘토 바로가기", "바로가기 링크")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(patched)

print("Forced patch on jobs.js completed successfully!")

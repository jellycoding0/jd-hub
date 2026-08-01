import os

def fix_file_encoding():
    file_path = "C:/ws/project_jelly/1.강의자료/1-3.직무분석(JD)/_기업별_/학습_가이드/멘토_추천_강의.md"
    
    with open(file_path, 'rb') as f:
        raw = f.read()
        
    # Check if raw starts with BOM (UTF-8-sig)
    if raw.startswith(b'\xef\xbb\xbf'):
        print("File is already in UTF-8-sig bytes.")
        # But let's verify if the text is decoded properly or already corrupted
        try:
            text = raw.decode('utf-8-sig')
            # If it has weird characters, it might have been saved as ANSI without BOM but parsed as UTF-8
            print("Successfully decoded as UTF-8-sig.")
        except Exception as e:
            text = raw.decode('cp949', errors='ignore')
            print("Failed UTF-8-sig decode, fallback to CP949.")
    else:
        # Likely ANSI/CP949 from Windows Notepad
        try:
            text = raw.decode('cp949')
            print("Decoded as CP949 successfully.")
        except Exception as e:
            text = raw.decode('utf-8', errors='ignore')
            print("Fallback to UTF-8 dec.")

    # Write back cleanly in UTF-8-sig
    with open(file_path, 'w', encoding='utf-8-sig') as f:
        f.write(text)
    print("Saved file as clean UTF-8-sig.")

if __name__ == "__main__":
    fix_file_encoding()

import os

base_dir = r"C:\ws\project_jelly\1.강의자료\1-3.직무분석(JD)\직무별_면접_기출_빈출_질문"

titles = {
    "로봇개발직무 공통.md": "# 로봇개발직무 공통 면접 빈출 질문 (Robotics System Integration / HW-SW Fusion)",
    "SW.md": "# SW 직무 면접 빈출 질문 (Robot Software / C++ / ROS 2 / Linux)",
    "AI학습.md": "# AI학습 직무 면접 빈출 질문 (Machine Learning / Deep Learning / Computer Vision / Robot AI)",
    "임베디드.md": "# 임베디드 직무 면접 빈출 질문 (Embedded Software / MCU / RTOS / Motor Control)",
    "제어.md": "# 제어 직무 면접 빈출 질문 (Robot Control / PID / Dynamics / Motion Control)",
    "자율주행.md": "# 자율주행 직무 면접 빈출 질문 (Autonomous Driving / SLAM / Path Planning / Sensor Fusion)",
    "기구설계.md": "# 기구설계 직무 면접 빈출 질문 (Mechanism / Mechanical Design / Robot Joint)",
    "회로설계.md": "# 회로설계 직무 면접 빈출 질문 (Hardware Circuit / PCB / Motor Driver / Power Supply)",
    "생산기술.md": "# 생산기술 직무 면접 빈출 질문 (Manufacturing Engineering / Mass Production / Process Automation)",
    "시험평가.md": "# 시험평가 직무 면접 빈출 질문 (Robot Reliability / Performance Evaluation / Qualification)",
    "안전.md": "# 안전 직무 면접 빈출 질문 (Robot Safety Standards / Risk Assessment / Functional Safety)",
    "인증.md": "# 인증 직무 면접 빈출 질문 (Global Compliance / CE / UL / KCs / Regulatory)",
    "데이터.md": "# 데이터 & DevOps 직무 면접 빈출 질문 (Data Pipeline / MLOps / Telemetry / Edge Infrastructure)",
    "보안.md": "# 보안 직무 면접 빈출 질문 (Cybersecurity / SROS2 / OT Security / Firmware Security)",
    "품질.md": "# 품질 직무 면접 빈출 질문 (Quality Assurance / QA & QC / Inspection / 8D Report)",
    "기획.md": "# 기획 직무 면접 빈출 질문 (Product Planning / PRD / Market Analysis / Business Strategy)"
}

for filename, new_title in titles.items():
    file_path = os.path.join(base_dir, filename)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        if lines and lines[0].startswith('# '):
            lines[0] = new_title + "\n"
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
            
        print(f"Updated title for {filename}")

print("\nAll 16 interview titles refined with professional English subheadings!")

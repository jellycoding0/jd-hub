import os

base_dir = r"C:\ws\project_jelly\1.강의자료\1-3.직무분석(JD)\직무별_면접_기출_빈출_질문"

target_positions = {
    "로봇개발직무 공통.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **HD현대로보틱스**: 로봇 시스템 개발자, 로봇 융합 프로젝트 엔지니어
> - **두산로보틱스**: 협동로봇 총괄 개발자, 로봇 아키텍처 엔지니어
> - **레인보우로보틱스**: 로봇 구동부 및 시스템 통합 엔지니어
> - **1X Technologies / Figure AI**: Robotics Systems Integration Engineer""",

    "SW.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **두산로보틱스**: 로봇 프레임워크 개발자 (Linux), 로봇 응용 소프트웨어(Application/UI) 개발자
> - **HD현대로보틱스**: 로봇 제어기 소프트웨어 개발자, 로봇 티칭 펜던트 & UI 앱 개발자
> - **로보티즈**: 로봇 SW 개발자 (ROS 2 / C++), 자율주행 모바일 로봇 SW 및 관제 FMS 개발자
> - **1X Technologies**: Software Engineer - Operating Systems / Core Infrastructure
> - **삼성전자 / LG전자**: 미래로봇 SW 시스템 개발자, CLOi 로봇 솔루션 SW 개발자""",

    "AI학습.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **1X Technologies**: AI Researcher - Reinforcement Learning / Vision-Language-Action
> - **Figure AI**: AI / Computer Vision Engineer - Robot Manipulation & Perception
> - **HD현대로보틱스**: 로봇 AI & 비전 시맨틱 인지 엔지니어
> - **두산로보틱스**: AI 기반 로봇 조작(Manipulation) & 6D Pose Estimation 개발자""",

    "임베디드.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **HD현대로보틱스**: 로봇 임베디드 SW 개발자, 관절 모터 드라이버 펌웨어 개발자
> - **두산로보틱스**: 로봇 관절 모듈 펌웨어 엔지니어 (RTOS / EtherCAT)
> - **로보티즈**: 스마트 액츄에이터 MCU / FreeRTOS 펌웨어 개발자
> - **1X Technologies**: Embedded Engineer - Motors and Drives / Actuators""",

    "제어.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **두산로보틱스**: 로봇 제어 엔지니어 (Robot Control / Motion Control)
> - **HD현대로보틱스**: 로봇 모션 제어기 및 동역학 보상 알고리즘 개발자
> - **레인보우로보틱스**: 이족/다족 보행 로봇 제어 엔지니어
> - **Boston Dynamics**: Controls Engineer - Dynamics & Whole-body Control""",

    "자율주행.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **로보티즈**: 자율주행 SLAM 및 경로 계획(Path Planning) 엔지니어
> - **1X Technologies / Figure AI**: Autonomous Navigation & 3D Lidar SLAM Engineer
> - **HD현대로보틱스**: AMR 자율주행 제어 및 Nav2 센서 퓨전 개발자
> - **삼성전자**: 자율주행 모바일 로봇(AMR) 로컬/글로벌 플래너 개발자""",

    "기구설계.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **두산로보틱스**: 로봇 기구설계 엔지니어 (Robot Mechanical Design)
> - **HD현대로보틱스**: 로봇 관절 및 감속기 메카니즘 설계자
> - **레인보우로보틱스**: 다자유도 로봇 관절 모듈 및 프레임 설계자
> - **1X Technologies**: Mechanical Engineer - Actuators and Drives""",

    "회로설계.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **1X Technologies**: Electrical Engineer - Actuators and Drives / Power Electronics
> - **HD현대로보틱스**: 로봇 제어반 및 모터 드라이버 PCB 회로 설계자
> - **두산로보틱스**: 전력 전자 및 하이볼테이지 인버터 회로 개발자""",

    "생산기술.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **HD현대로보틱스**: 로봇 양산 공정 설계 및 조립 자동화 라인 생산기술자
> - **두산로보틱스**: 로봇 관절 모듈 양산 기술 및 공정 정밀 지그 설계자
> - **레인보우로보틱스**: 로봇 제조 공정 최적화 및 EOL 검사 설비 엔지니어""",

    "시험평가.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **1X Technologies**: Test & Validation Engineer - Motors and Actuators
> - **HD현대로보틱스**: 로봇 성능 시험 및 신뢰성 평가 엔지니어 (ISO 9283)
> - **두산로보틱스**: 로봇 내구성 수명 시험 및 온습도 환경 신뢰성 검증 엔지니어""",

    "안전.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **두산로보틱스**: 로봇 안전 및 규격(ISO 13849 / ISO/TS 15066) 엔지니어
> - **HD현대로보틱스**: 로봇 기능 안전(Functional Safety) 및 위험성 평가 엔지니어
> - **1X Technologies**: Safety Systems Engineer - Robot Hardware & Controls""",

    "인증.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **HD현대로보틱스**: 로봇 글로벌 인증 및 CE / UL / KCs 인허가 담당자
> - **두산로보틱스**: 해외 수출 규격 적합성 성적서(DoC) 및 기술문서(TCF) 엔지니어
> - **로보티즈**: 로봇 전자파 적합성(EMC) 및 무선 전파인증 전담자""",

    "데이터.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **1X Technologies**: Data & DevOps Engineer - Telemetry & Edge Infrastructure
> - **두산로보틱스**: 로봇 텔레메트리 데이터 파이프라인 & MLOps 엔지니어
> - **HD현대로보틱스**: 예지보전(PdM) 데이터 분석 및 로봇 관제 데이터 플랫폼 엔지니어""",

    "보안.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **HD현대로보틱스**: 로봇 AI & 로보틱스 보안 엔지니어 (SROS2 / OT 보안)
> - **1X Technologies**: Cybersecurity Engineer - Robot Firmware & Cloud Network
> - **두산로보틱스**: 로봇 제어기 사이버 복원력 및 Secure Boot 펌웨어 보안 담당자""",

    "품질.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **HD현대로보틱스**: 로봇 부품 수검 검사(IQC) 및 필드 클레임 품질 보증(QA) 엔지니어
> - **두산로보틱스**: 로봇 관절 감속기 정밀 품질 검증 및 협력사 품질 관리자(SQA)
> - **레인보우로보틱스**: 출하 검사(OQC) 및 신제품 양산 승인(PPAP) 품질 엔지니어""",

    "기획.md": """> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **두산로보틱스**: 로봇 상품 기획 및 PRD / 비즈니스 로드맵 담당자
> - **HD현대로보틱스**: 로봇 어플리케이션 시장 분석 및 목표 원가(BOM) 기획자
> - **로보티즈**: 서비스 로봇 신사업 기획 및 RaaS 렌탈 비즈니스 담당자"""
}

for filename, guide_text in target_positions.items():
    file_path = os.path.join(base_dir, filename)
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if guide already exists
        if "관련 대표 채용 포지션" not in content:
            lines = content.split('\n')
            # Insert guide right after the main title line and its separator
            if lines and lines[0].startswith('# '):
                # find first '---' line
                sep_idx = -1
                for idx, l in enumerate(lines[:5]):
                    if l.strip() == '---':
                        sep_idx = idx
                        break
                
                if sep_idx != -1:
                    lines.insert(sep_idx + 1, "\n" + guide_text + "\n")
                else:
                    lines.insert(1, "\n" + guide_text + "\n")
                
                new_content = '\n'.join(lines)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Added target positions guide to {filename}")

print("\nAll 16 interview files updated with target position guides!")

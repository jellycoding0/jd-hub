import os
import re

base_dir = r"C:\ws\project_jelly\1.강의자료\1-3.직무분석(JD)\직무별_면접_기출_빈출_질문"

# Mapping for Korean tech words to English tech terms in content
replacements = [
    (r'오버피팅', 'Overfitting'),
    (r'파인튜닝', 'Fine-tuning'),
    (r'전이학습', 'Transfer Learning'),
    (r'드롭아웃', 'Dropout'),
    (r'인터럽트', 'Interrupt'),
    (r'폴링', 'Polling'),
    (r'뮤텍스', 'Mutex'),
    (r'세마포어', 'Semaphore'),
    (r'데드락', 'Deadlock'),
    (r'오도메트리', 'Odometry'),
    (r'캘리브레이션', 'Calibration'),
    (r'파티클 필터', 'Particle Filter'),
    (r'칼만 필터', 'Kalman Filter'),
    (r'파이프라인', 'Pipeline'),
    (r'프레임워크', 'Framework'),
    (r'아키텍처', 'Architecture'),
    (r'오버슈트', 'Overshoot'),
    (r'자코비안', 'Jacobian'),
    (r'백래시', 'Backlash'),
    (r'노치 필터', 'Notch Filter'),
    (r'캐스케이드', 'Cascade'),
    (r'엔코더', 'Encoder'),
    (r'디버깅', 'Debugging'),
    (r'시뮬레이션', 'Simulation'),
    (r'시뮬레이터', 'Simulator'),
    (r'스레드', 'Thread'),
    (r'멀티스레드', 'Multi-thread'),
    (r'프로세스', 'Process'),
    (r'컴파일러', 'Compiler'),
    (r'다운샘플링', 'Downsampling'),
    (r'양자화', 'Quantization'),
    (r'가지치기', 'Pruning'),
    (r'지식 증류', 'Knowledge Distillation'),
    (r'레이블링', 'Labeling'),
    (r'클러스터링', 'Clustering'),
    (r'파티셔닝', 'Partitioning'),
    (r'컨테이너', 'Container'),
    (r'오케스트레이션', 'Orchestration'),
    (r'텔레메트리', 'Telemetry'),
    (r'인제션', 'Ingestion'),
    (r'레이크하우스', 'Lakehouse'),
    (r'대시보드', 'Dashboard'),
    (r'인터페이스', 'Interface'),
    (r'포인터', 'Pointer'),
    (r'레지스터', 'Register'),
    (r'모듈', 'Module'),
    (r'패키지', 'Package'),
    (r'알고리즘', 'Algorithm'),
    (r'파라미터', 'Parameter'),
    (r'프로토콜', 'Protocol'),
    (r'스케줄링', 'Scheduling'),
    (r'스케줄러', 'Scheduler'),
]

for file_name in os.listdir(base_dir):
    if file_name.endswith('.md'):
        file_path = os.path.join(base_dir, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Apply term replacements
        for src, target in replacements:
            content = re.sub(src, target, content)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
        print(f"Refined English terms in {file_name}")

print("\nAll files refined with English technical terminology successfully!")

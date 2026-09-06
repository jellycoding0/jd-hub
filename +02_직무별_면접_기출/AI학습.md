# AI학습 직무 면접 빈출 질문 (Machine Learning / Deep Learning / Computer Vision / Robot AI)

---

> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **1X Technologies**: AI Researcher - Reinforcement Learning / Vision-Language-Action
> - **Figure AI**: AI / Computer Vision Engineer - Robot Manipulation & Perception
> - **HD현대로보틱스**: 로봇 AI & 비전 시맨틱 인지 엔지니어
> - **두산로보틱스**: AI 기반 로봇 조작(Manipulation) & 6D Pose Estimation 개발자


## Q1. [개념/이론] CNN의 동작 원리와 Pooling의 역할에 대해 설명해주세요. [빈출]

- **답변 예시**: 필터를 통해 이미지의 공간적 특징을 추출하며, Pooling은 Parameter를 줄여 연산량을 감소시키고 특징의 위치 변화에 대한 모델의 강건성을 높임.

---

## Q2. [개념/이론] Object Detection에서 1-stage detector와 2-stage detector의 차이는 무엇인가? [빈출]

- **답변 예시**: 2-stage는 객체 후보 영역 추출과 분류를 순차적으로 수행해 정확도가 높고, 1-stage는 이를 동시에 수행하여 실시간 로봇 비전 처리에 유리할 만큼 빠릅니다.

---

## Q3. [실무/트러블슈팅] Overfitting이 발생했을 때 이를 해결하기 위한 방법들을 제시해 볼 것. [빈출]

- **답변 예시**: 학습 데이터를 증강(Augmentation)하거나, 모델 복잡도를 줄이는 정규화(L1/L2) 및 Dropout을 적용하고 조기 종료(Early Stopping)를 사용함.

---

## Q4. [개념/이론] 활성화 함수로 Sigmoid 대신 ReLU를 주로 사용하는 이유는 무엇인가? [빈출]

- **답변 예시**: Sigmoid는 층이 깊어질수록 역전파 시 기울기가 0으로 수렴하는 기울기 소실 문제가 발생하지만, ReLU는 양수 영역에서 기울기가 1로 유지되어 이를 방지하고 연산이 빠릅니다.

---

## Q5. [개념/이론] Batch Normalization의 동작 원리와 장점에 대해 설명해주세요. [빈출]

- **답변 예시**: 각 층의 입력 분포를 미니배치 단위로 정규화하여 학습을 안정화시키고, 학습 속도를 높일 수 있으며 초기화에 대한 의존도를 낮춥니다.

---

## Q6. [개념/이론] Vision Transformer(ViT)의 특징과 기존 CNN과의 차이점은 무엇인가? [빈출]

- **답변 예시**: CNN은 국소적(Local) 특징 추출에 강하지만, ViT는 이미지를 패치로 나누어 Self-Attention을 적용함으로써 이미지 전체의 문맥(Global Context)을 파악하는 데 유리함.

---

## Q7. [실무/트러블슈팅] Sim-to-Real Transfer(Simulation에서 학습한 정책을 실제 로봇에 적용) 시 발생하는 Domain Gap 극복 방법은? [빈출]

- **답변 예시**: Simulation 내 마찰력, 텍스처, 조명, 질량 등을 무작위로 변경하는 Domain Randomization 기법을 적용하고, 실제 로봇 센서 데이터를 이용해 Fine-tuning을 수행함.

---

## Q8. [개념/이론] 3D PointCloud 데이터 처리를 위한 PointNet/PointNet++의 핵심 구조와 특징은 무엇인가? [빈출]

- **답변 예시**: 점군의 순서 불변성(Permutation Invariance)을 해결하기 위해 대칭 함수인 Max Pooling을 활용하며, PointNet++는 국소적 지역 구조를 단계적으로 학습하여 3D 인식 성능을 높임.

---

## Q9. [시스템/응용] 6D Pose Estimation Algorithm의 작동 방식과 로봇 그리핑/만니퓰레이션에서의 중요성은? [빈출]

- **답변 예시**: 물체의 3차원 위치(X,Y,Z)와 회전 각도(Roll,Pitch,Yaw)를 동시에 추정하여, 로봇 그리퍼가 임의 배치된 물체를 정확하고 안정적인 각도로 집어 올릴 수 있도록 지원함.

---

## Q10. [시스템/응용] 엣지 디바이스(NVIDIA Jetson, NPU) 탑재를 위한 딥러닝 모델 경량화(Quantization, Pruning, Knowledge Distillation) 기법은? [빈출]

- **답변 예시**: FP32 가중치를 INT8로 Quantization(TensorRT 적용)하여 메모리와 연산 속도를 극대화하고, 불필요한 뉴런을 Pruning(Pruning)하여 저전력 엣지 환경에 최적화함.

---

## Q11. [실무/트러블슈팅] 강화학습(RL) 기반 로봇 제어 시 Reward Function 설계 시 주의할 점과 Reward Shaping 기술은? [빈출]

- **답변 예시**: 부적절한 보상 설계는 로봇의 기이한 편법 동작을 유발하므로, 에이전트가 탐색 과정을 원활히 거칠 수 있도록 중간 단계 보상을 정교하게 다듬는 Reward Shaping을 적용함.

---

## Q12. [개념/이론] 딥러닝 기반 Segmentation에서 Semantic과 Instance Segmentation의 차이는 무엇인가? [빈출]

- **답변 예시**: Semantic은 같은 클래스(예: 사람)의 픽셀을 동일하게 취급하지만, Instance는 같은 클래스라도 개별 객체(사람1, 사람2)를 독립적으로 구분하여 인지함.

---

## Q13. [개념/이론] 카메라 Calibration(Camera Calibration)의 목적과 내부/외부 Parameter의 물리적 의미는? [빈출]

- **답변 예시**: 렌즈 왜곡을 보정하고 3D 공간과 2D 이미지 평면 간의 변환 관계를 구하기 위함이며, 내부 Parameter는 초점거리/주점, 외부 Parameter는 카메라의 3D 위치와 자세를 의미함.

---

## Q14. [시스템/응용] 최근 주목받는 Vision-Language-Action (VLA) 모델이나 Diffusion Policy의 로봇 조작 적용 가능성은? [빈출]

- **답변 예시**: 언어 명령과 비전 입력을 통합하여 복잡한 다단계 비정형 작업 명령을 이해하고, 연속적 동작 파형을 고품질로 생성함으로써 로봇의 범용 조작 능력을 대폭 끌어올립니다.

---

## Q15. [실무/트러블슈팅] 학습 데이터에 클래스 불균형(Imbalanced Data)이 있을 경우 해결하는 최신 손실 함수 및 데이터 기법은? [빈출]

- **답변 예시**: 소수 클래스 데이터를 증강(SMOTE, Mixup)하거나, 쉬운 샘플의 손실 가중치를 줄이고 어려운 샘플에 집중하는 Focal Loss 기법을 사용함.

---

## Q16. [시스템/응용] RGB-D 센서 데이터를 입력으로 받는 3D Object Detection (VoteNet, Frustum PointNet) Algorithm의 원리는? [빈출]

- **답변 예시**: 2D 이미지 기반 딥러닝 박스를 3D 공간으로 투영(Frustum)한 뒤 3D 점군 기반 딥러닝으로 물체 차원 및 Bounding Box를 최종 추정함.

---

## Q17. [개념/이론] Self-Supervised Learning(자가지도 학습 - SimCLR, DINO) 기법이 라벨 없는 로봇 비전데이터 활용에 미치는 장점은? [빈출]

- **답변 예시**: 대규모 라벨 없는 로봇 카메라/센서 데이터로부터 우수한 representation을 사전 학습함으로써, 적은 라벨 데이터로도 Fine-tuning 성능을 극대화함.

---

## Q18. [실무/트러블슈팅] 로봇 카메라 렌즈의 광각 왜곡(Fisheye Lens Distortion)을 보정하고 DNN 모델 입력을 맞추는 Pre-processing 기법은? [빈출]

- **답변 예시**: OpenCV의 fisheye 카메라 모델 체계를 사용하여 미디엄 왜곡 커스텀 Parameter 행렬을 산출하고, 렌즈 왜곡을 펴주는 Undistortion 맵핑을 실시간 전처리함.

---

## Q19. [개념/이론] Generative Adversarial Networks (GAN)을 활용한 로봇 데이터 증강(Augmentation) 사례는? [빈출]

- **답변 예시**: CycleGAN을 이용하여 비 오는 날이나 야간 특수 환경 데이터를 Simulation 합성 데이터 생성으로 보강함으로써, 로봇 비전 모델의 환경 강건성을 높임.

---

## Q20. [시스템/응용] 로봇 조작(Manipulation) 시 모션 데이터의 시계열적 궤적을 제어하기 위한 Behavioral Cloning과 DAgger Algorithm의 특징은? [빈출]

- **답변 예시**: Behavioral Cloning은 전문가 시연 데이터를 지도학습하지만 에러 누적에 취약함. DAgger는 에이전트 구동 중 전문가의 피드백 데이터를 추가 수집 및 재학습하여 강건성을 보장함.

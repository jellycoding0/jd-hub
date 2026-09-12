# AI 학습 직무 면접 빈출 질문 (Machine Learning / Deep Learning / Computer Vision / Robot AI)

---

> **관련 대표 채용 포지션**
> * **1X Technologies**: AI Researcher - Reinforcement Learning / Vision-Language-Action
> * **Figure AI**: AI / Computer Vision Engineer - Robot Manipulation & Perception
> * **HD현대로보틱스**: 로봇 AI & 비전 시맨틱 인지 엔지니어
> * **두산로보틱스**: AI 기반 로봇 조작(Manipulation) & 6D Pose Estimation 개발자
> 
> 

---

## Q1. [개념/이론] CNN의 동작 원리와 Pooling의 역할에 대해 설명할 것. [빈출]

* **답변 요약**: Convolution 연산(필터)을 통해 이미지의 공간적 특징(Spatial Feature)을 추출함. Pooling은 피처맵 크기를 줄여 파라미터 수와 연산량을 감소시키고, 입력의 미세한 위치 이동에 영향을 덜 받는 평행이동 불변성(Translation Invariance)을 확보함.

---

## Q2. [개념/이론] Object Detection에서 1-stage detector와 2-stage detector의 차이는 무엇인가? [빈출]

* **답변 요약**: 2-stage(Faster R-CNN 등)는 후보 영역 제안(RPN)과 분류/회귀를 순차 처리하여 정확도가 높지만 연산이 느림. 1-stage(YOLO, SSD 등)는 단일 파이프라인에서 위치와 분류를 동시 예측하여 실시간 추론(로봇 실시간 제어)에 유리함.

---

## Q3. [실무/트러블슈팅] Overfitting이 발생했을 때 이를 해결하기 위한 엔지니어링 접근법은? [빈출]

* **답변 요약**: 데이터 측면에서는 Augmentation(회전, 노이즈 추가, CutMix 등)을 적용함. 모델 측면에서는 L1/L2 Weight Decay, Dropout, Batch Normalization을 추가하거나 모델 복잡도를 줄임. 학습 제어 측면에서는 Early Stopping을 적용함.

---

## Q4. [개념/이론] 활성화 함수로 Sigmoid 대신 ReLU 계열을 주로 사용하는 이유는 무엇인가? [빈출]

* **답변 요약**: Sigmoid는 입력 절댓값이 클 때 미분값이 0에 수렴하여 역전파 시 기울기 소실(Vanishing Gradient)이 발생함. ReLU는 양수 영역의 기울기가 1로 유지되어 역전파 시 기울기 소실을 억제하며, 지수 연산이 없어 연산 속도가 빠름.

---

## Q5. [개념/이론] Batch Normalization의 동작 원리와 도입 효과는? [빈출]

* **답변 요약**: 미니배치 단위로 평균과 분산을 구해 입력을 정규화하고, 재스케일링/이동 파라미터($\gamma, \beta$)를 학습시킴. 내부 공변량 변화(Internal Covariate Shift)를 완화하여 가중치 초기화 민감도를 낮추고, 더 큰 학습률을 적용할 수 있게 하여 수렴 속도를 높임.

---

## Q6. [개념/이론] Vision Transformer(ViT)의 특징과 기존 CNN과의 차이점은? [빈출]

* **답변 요약**: CNN은 귀납적 편향(Inductive Bias, 국소성 및 평행이동 불변성)이 강해 적은 데이터에서도 안정적으로 국소 특징을 잡음. ViT는 이미지를 패치 단위로 쪼갠 뒤 Self-Attention을 적용하여 전역적 문맥(Global Context)을 초기에 파악하지만, 대규모 데이터셋 사전 학습이 필수적임.

---

## Q7. [실무/트러블슈팅] Sim-to-Real Transfer(시뮬레이션 정책의 실물 로봇 적용) 시 발생하는 Domain Gap 극복 방법은? [빈출]

* **답변 요약**: 시뮬레이션 환경의 물리 파라미터(마찰 계수, 질량, 지연 시간)와 시각 요소(조명, 텍스처, 카메라 위치)를 무작위로 흔드는 Domain Randomization을 적용함. 추가로 실제 로봇에서 수집한 소량의 데이터로 Residual Policy 학습이나 System Identification 기반 파라미터 캘리브레이션을 병행함.

---

## Q8. [개념/이론] 3D Point Cloud 데이터 처리를 위한 PointNet/PointNet++의 핵심 구조는? [빈출]

* **답변 요약**: 점군의 순서 불변성(Permutation Invariance)을 만족시키기 위해 대칭 함수인 Max Pooling을 채택함. PointNet은 전역 특징만 추출하는 한계가 있어, PointNet++는 Hierarchical Feature Learning 구조(Sampling 및 Grouping)를 도입해 국소적(Local) 기하 구조를 단계적으로 학습함.

---

## Q9. [시스템/응용] 6D Pose Estimation의 출력값과 로봇 매니퓰레이션에서의 역할은? [빈출]

* **답변 요약**: 물체의 3차원 위치(X, Y, Z)와 3차원 회전 각도(Roll, Pitch, Yaw 또는 쿼터니언) 총 6개 자유도를 추정함. 로봇 제어기는 이 변환 행렬($SE(3)$)을 기반으로 엔드이펙터의 접근 벡터와 그리퍼 개폐 지점을 계산하여 비정형 환경 물체를 충돌 없이 파지(Grasp)함.

---

## Q10. [시스템/응용] 엣지 보드(NVIDIA Jetson 등) 탑재를 위한 모델 경량화 기법(양자화, 가지치기, 지식 증류)의 차이는? [빈출]

* **답변 요약**:
* **Quantization(양자화)**: FP32 가중치/활성화를 INT8 등으로 축소하여 메모리 대역폭 절감 및 TensorRT 연산 가속.
* **Pruning(가지치기)**: 기여도가 낮은 가중치나 채널을 제거하여 연산량(FLOPs) 축소.
* **Knowledge Distillation(지식 증류)**: 큰 교사 모델(Teacher)의 출력을 작은 학생 모델(Student)이 학습하도록 유도.



---

## Q11. [실무/트러블슈팅] 로봇 강화학습(RL) 환경 구축 시 Reward Shaping 적용 시 주의할 점은? [빈출]

* **답변 요약**: 불필요한 보상 항이 많아지면 로봇이 의도와 다른 비정상적인 동작(Reward Hacking)을 학습할 위험이 있음. 최종 태스크 달성 여부를 나타내는 Sparse Reward와 진행 방향을 유도하는 Potential-based Reward Shaping을 수학적으로 설계하여 최적 정책의 불변성을 유지해야 함.

---

## Q12. [개념/이론] Segmentation에서 Semantic Segmentation과 Instance Segmentation의 차이는? [빈출]

* **답변 요약**: Semantic Segmentation은 동일한 클래스에 속한 모든 픽셀에 동일한 라벨을 부여함. Instance Segmentation은 동일 클래스 내에서도 개별 물체 인스턴스(객체 1, 객체 2)를 서로 다른 마스크로 분리하여 식별함.

---

## Q13. [개념/이론] 카메라 Calibration의 목적과 내부/외부 파라미터의 물리적 의미는? [빈출]

* **답변 요약**: 3D 실세계 좌표와 2D 이미지 픽셀 좌표 간의 기하학적 변환 관계를 규명하고 렌즈 왜곡을 보정하는 과정임.
* **내부 파라미터(Intrinsic)**: 초점 거리($f_x, f_y$), 주점($c_x, c_y$), 왜곡 계수(비대칭/방사 왜곡).
* **외부 파라미터(Extrinsic)**: 월드 좌표계 기준 카메라의 3차원 위치(변위 벡터 $T$)와 자세(회전 행렬 $R$).



---

## Q14. [시스템/응용] Vision-Language-Action (VLA) 모델과 Diffusion Policy의 로봇 조작 적용 특징은? [빈출]

* **답변 요약**: VLA 모델(RT-2 등)은 사전 학습된 멀티모달 LLM에 로봇 관절 액션 토큰을 결합하여 고수준 언어 명령을 직접 엔드이펙터 동작으로 변환함. Diffusion Policy는 복잡한 다봉(Multimodal) 행동 분포를 노이즈 제거 과정으로 정밀하게 모델링하여 부드럽고 정밀한 궤적 생성을 지원함.

---

## Q15. [실무/트러블슈팅] 클래스 불균형(Class Imbalance) 환경에서 적용할 수 있는 손실 함수 및 데이터 처리 기법은? [빈출]

* **답변 요약**: 데이터 측면에서는 소수 클래스 오버샘플링(SMOTE 등)이나 CutMix를 적용함. 손실 함수 측면에서는 쉬운 샘플의 가중치를 낮추고 오분류 샘플에 집중하는 Focal Loss를 적용하거나, 클래스 빈도수의 역수를 취한 Weighted Cross Entropy Loss를 사용함.

---

## Q16. [시스템/응용] RGB-D 센서 기반 3D Object Detection 알고리즘의 동작 방식은? [빈출]

* **답변 요약**: Frustum PointNet은 2D 이미지 탐지로 영역을 먼저 좁힌 뒤 해당 Frustum 내부의 3D 점군에 PointNet을 적용함. VoteNet은 2D 탐지기를 거치지 않고 깊이(Depth) 포인트 클라우드에서 직접 Deep Hough Voting을 수행해 물체 중심점을 예측하고 3D Bounding Box를 추정함.

---

## Q17. [개념/이론] Self-Supervised Learning(자가지도 학습) 기법이 로봇 비전 데이터 처리에 주는 이점은? [빈출]

* **답변 요약**: 대규모 라벨링 비용 없이 로봇 카메라가 수집한 방대한 비디오 스트림에서 Contrastive Learning(SimCLR)이나 Masked Autoencoding(MAE), Feature Distillation(DINO)을 통해 시각 표현(Representation)을 사전 학습함. 이후 소량의 라벨 데이터만으로 다운스트림 태스크에 빠르게 전이 가능함.

---

## Q18. [실무/트러블슈팅] 광각/어안 렌즈 왜곡(Fisheye Distortion) 보정 및 모델 입력 전처리 파이프라인은? [빈출]

* **답변 요약**: 체커보드 패턴을 이용해 OpenCV Fisheye 카메라 모델의 왜곡 계수($k_1, k_2, k_3, k_4$)를 도출함. `cv2.fisheye.undistortImage` 또는 매핑 테이블(`initUndistortRectifyMap`)을 구성하여 추론 파이프라인 전단에서 실시간 왜곡 보정을 적용한 뒤 DNN 입력 크기로 리사이징함.

---

## Q19. [개념/이론] 로봇 도메인에서 CycleGAN을 활용한 데이터 증강(Augmentation) 사례는? [빈출]

* **답변 요약**: 페어(Pair) 데이터가 없는 조건에서 주간-야간, 맑은 날-악천후, 시뮬레이션-실제 영상 간의 스타일 변환(Style Transfer)을 수행함. 시뮬레이션 합성 데이터의 텍스처를 실제 로봇 공장 환경의 텍스처로 변환하여 실물 데이터 취득 한계를 보완함.

---

## Q20. [시스템/응용] Imitation Learning에서 Behavioral Cloning과 DAgger 알고리즘의 차이와 한계 극복 방식은? [빈출]

* **답변 요약**: Behavioral Cloning은 전문가 궤적을 지도학습으로 단순 모방하므로, 한 번 궤도를 이탈하면 에러가 누적(Covariate Shift)되어 복구가 불가능함. DAgger(Dataset Aggregation)는 학습된 정책으로 로봇을 직접 구동시키면서 방문한 상태에 대해 전문가의 올바른 액션을 추가 라벨링하여 데이터셋을 누적 재학습함으로써 오차 누적 문제를 완화함.
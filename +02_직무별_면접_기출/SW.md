# SW 직무 면접 빈출 질문 (Robot Software / C++ / ROS 2 / Linux)

---

> **관련 대표 채용 포지션 (실제 채용공고 기반)**
> - **두산로보틱스**: 로봇 프레임워크 개발자 (Linux), 로봇 응용 소프트웨어(Application/UI) 개발자
> - **HD현대로보틱스**: 로봇 제어기 소프트웨어 개발자, 로봇 티칭 펜던트 & UI 앱 개발자
> - **로보티즈**: 로봇 SW 개발자 (ROS 2 / C++), 자율주행 모바일 로봇 SW 및 관제 FMS 개발자
> - **1X Technologies**: Software Engineer - Operating Systems / Core Infrastructure
> - **삼성전자 / LG전자**: 미래로봇 SW 시스템 개발자, CLOi 로봇 솔루션 SW 개발자


## Q1. [개념/이론] Modern C++ (C++11/14/17/20)에서 스마트 Pointer(unique_ptr, shared_ptr, weak_ptr)의 특징과 메모리 관리 원리를 설명할 것. [빈출]

- **답변 예시**: unique_ptr은 단일 소유권을 보장하여 자원 해제를 자동화하며, shared_ptr은 참조 카운팅 제어 블록을 공유함. weak_ptr은 순환 참조로 인한 메모리 누수를 방지하기 위해 shared_ptr을 약하게 참조함.

---

## Q2. [개념/이론] ROS 2와 ROS 1의 구조적 차이점 및 ROS 2에서 도입된 DDS(Data Distribution Service)의 장점은? [빈출]

- **답변 예시**: ROS 1은 단일 마스터(roscore) 의존성이 있었으나 ROS 2는 DDS 기반 분산 구조로 통신 신뢰성을 높였음. QoS(Quality of Service) 설정을 통해 듀라빌리티, 신뢰성, 레이턴시를 자유롭게 조절할 수 있습니다.

---

## Q3. [실무/트러블슈팅] Linux 환경에서 멀티Thread 프로그래밍 시 Deadlock(Deadlock)의 발생 조건 4가지와 이를 방지하는 방법은? [빈출]

- **답변 예시**: 상호 배제, 점유 및 대기, 비선점, 순환 대기가 충족될 때 발생하며, 락 획득 순서를 고정하거나 std::lock, lock_guard 사용 및 타임아웃 락 기법으로 방지함.

---

## Q4. [시스템/응용] C++의 이동 언어 구조(Move Semantics)와 rvalue 참조(&&)가 로봇 SW 성능 최적화에 미치는 영향은? [빈출]

- **답변 예시**: 대용량 점군(PointCloud) 데이터나 센서 배열 객체 전달 시 깊은 복사를 피하고 자원의 소유권만 이전(std::move)함으로써 메모리 할당 및 복사 오버헤드를 획기적으로 줄임.

---

## Q5. [개념/이론] ROS 2에서 Executor 및 Callback Group(Mutually Exclusive, Reentrant)의 동작 원리는 무엇인가? [빈출]

- **답변 예시**: Executor는 노드의 콜백 Scheduling을 담당하며, Mutually Exclusive는 그룹 내 한 콜백만 실행되도록 락을 걸고 Reentrant는 여러 Thread가 동시에 그룹 내 콜백들을 병렬 실행하게 합니다.

---

## Q6. [시스템/응용] 리눅스 환경에서 Zero-copy 메모리 전달 기법이나 Shared Memory 통신의 동작 메커니즘은? [빈출]

- **답변 예시**: Process 간 통신(IPC) 시 커널 공간을 거치지 않고 물리 메모리 영역을 Process 주소 공간에 직접 맵핑(shm_open, mmap)하여 센서 대용량 패킷 전달 지연시간을 수 마이크로초 단위로 단축함.

---

## Q7. [개념/이론] 객체지향 프로그래밍 SOLID 원칙이 로봇 Module식 소프트웨어 설계에 어떻게 적용되는가? [빈출]

- **답변 예시**: 단일 책임 원칙으로 센서 드라이버와 제어 로직을 분리하고, 의존성 역전 원칙을 통해 하드웨어 추상화 레이어(HAL) Interface를 정의함으로써 실제 로봇 부품 교체 시 상위 로직 변경을 최소화함.

---

## Q8. [실무/트러블슈팅] C++ 메모리 파편화(Memory Fragmentation) 문제와 동적 할당 최소화를 위한 커스텀 메모리 풀(Memory Pool) 설계 방법은? [빈출]

- **답변 예시**: 런타임 중 new/delete 반복 시 메모리 구멍이 생겨 RTOS나 MCU 성능을 떨어뜨립니다. 초기화 단계에서 고정 크기 메모리 블록 배열을 미리 생성하여 할당 및 반환을 O(1)에 처리하도록 설계함.

---

## Q9. [시스템/응용] 대규모 C++ 프로젝트에서의 CMake 빌드 시스템 구성 및 타겟 기반(Target-based) CMake 작성 방법은? [빈출]

- **답변 예시**: add_library 및 add_executable로 타겟을 명확히 정의하고, target_link_libraries 및 target_include_directories에 PUBLIC/PRIVATE/INTERFACE 의존성을 지정하여 Module 독립성을 지킵니다.

---

## Q10. [개념/이론] 리눅스 환경에서 Process 간 통신(IPC) 방식들(Socket, Pipe, Shared Memory, Message Queue)의 비교 및 선택 기준은? [빈출]

- **답변 예시**: 속도가 최우선인 점군 센서 데이터에는 Shared Memory를 사용하고, Process 격리 및 네트워크 확장이 필요한 제어 명령에는 TCP/UDP Socket 및 DDS 패킷 통신을 채택함.

---

## Q11. [실무/트러블슈팅] 로봇 SW 테스트 시 GoogleTest(gtest) 및 gmock을 활용한 단위 테스트(Unit Test) 및 목(Mock) 객체 활용법은? [빈출]

- **답변 예시**: 하드웨어 실물이 없는 상태에서 모터 드라이버 Interface 순수 가상 클래스를 상속받는 Mock 객체를 작성하고, 다양한 응답 및 예외 상황을 Simulation하여 상위 컨트롤러 Algorithm을 검증함.

---

## Q12. [개념/이론] ROS 2 Lifecycle Node(Managed Node)의 상태 전환(Unconfigured, Inactive, Active, Finalized) 목적은? [빈출]

- **답변 예시**: 로봇 시스템 초기화 시 센서 Calibration 및 통신 연결이 완료된 후 안전하게 구동 상태(Active)로 전환하게 함으로써 미준비 상태에서의 예기치 않은 모터 구동 사고를 방지함.

---

## Q13. [시스템/응용] 소프트웨어 버전 관리 시 Git Gitflow 전략과 CI/CD (GitHub Actions/Jenkins) Pipeline 자동화 구축 경험은? [빈출]

- **답변 예시**: feature 브랜치에서 기능 개발 후 PR 시 CI Pipeline에서 자동으로 static analysis(cppcheck), 단위 테스트, ROS 2 colcon build를 실행하여 코드 품질과 통합 안정성을 보장함.

---

## Q14. [실무/트러블슈팅] 실시간 프로파일링 툴(Valgrind, gprof, perf, htop)을 이용해 로봇 SW의 병목 지점 및 메모리 누수를 정밀 분석한 사례는? [빈출]

- **답변 예시**: Valgrind Memcheck로 누수 블록 위치를 탐지하고, perf 기반 flamegraph를 생성하여 반복 Algorithm 내 불필요한 복사 연산을 발견해 실행 시간을 35% 단축했음.

---

## Q15. [개념/이론] Design Pattern 중 로봇 프로그래밍에 유용한 Singleton, Factory, State, Observer 패턴의 적용 사례는? [빈출]

- **답변 예시**: 로봇의 전역 상태 관리에 State 패턴을 사용하여 [자율주행, 비상정지, 수동제어] 상태 전환을 체계화하고, 센서 이벤트 전파에는 Observer 패턴을 사용해 디커플링을 달성했음.

---

## Q16. [실무/트러블슈팅] C++20에서 새로 추가된 개념(Concepts, Coroutines, ranges)을 로봇 소프트웨어 최적화에 적용해 본 경험은? [빈출]

- **답변 예시**: Concepts를 사용해 템플릿 메타프로그래밍 컴파일 타임 Interface를 엄격히 검증하고, Coroutines를 활용해 비동기 I/O 이벤트 제어 수식을 가독성 높게 구현함.

---

## Q17. [시스템/응용] 로봇 제어 시스템에서의 실시간 Scheduling 정책(SCHED_FIFO, SCHED_RR)과 캐시 미스(Cache Miss) 줄이기 기법은? [빈출]

- **답변 예시**: 제어 Thread에 SCHED_FIFO 실시간 전용 Scheduling 및 CPU Affinity를 설정하고, 데이터 구조체를 cache-line(64바이트) 단위로 정렬하여 캐시 미스를 최소화함.

---

## Q18. [개념/이론] ROS 2에서 Component Node(Composable Node)의 개념과 동적 라이브러리(so) 로딩을 통한 메모리 절감은? [빈출]

- **답변 예시**: 개별 Process가 아닌 단일 Container Process 내부 동적 라이브러리로 여러 노드를 로딩하여, Process 간 IPC 오버헤드와 메모리 점유율을 획기적으로 줄임.

---

## Q19. [실무/트러블슈팅] 대용량 로그 데이터 및 멀티 Thread 가동 시 Thread-safe한 오디오/로그 라이브러리(spdlog 등) 구축 방안은? [빈출]

- **답변 예시**: 런타임 제어 루프를 방해하지 않도록 비동기 링 버퍼(Async Ring-buffer) 기반 spdlog 래퍼 클래스를 만들어 락-프리(Lock-free) 방식으로 대용량 로깅을 처리함.

---

## Q20. [시스템/응용] 로봇 소프트웨어 Architecture 설계 시 하드웨어 추상화 레이어(HAL - Hardware Abstraction Layer) 구축의 중요성은? [빈출]

- **답변 예시**: 모터 드라이버나 센서 상용 부품 변경 시 상위 경로 계획 및 제어 Algorithm 코드 수정 없이, 순수 가상 드라이버 Interface만 교체 튜닝할 수 있도록 유지보수성을 극대화함.

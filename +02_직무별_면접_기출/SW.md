# SW 직무 면접 빈출 질문 (Robot Software / C++ / ROS 2 / Linux)

---

> **관련 대표 채용 포지션**
> * **두산로보틱스**: 로봇 프레임워크 개발자 (Linux), 로봇 응용 소프트웨어(Application/UI) 개발자
> * **HD현대로보틱스**: 로봇 제어기 소프트웨어 개발자, 로봇 티칭 펜던트 & UI 앱 개발자
> * **로보티즈**: 로봇 SW 개발자 (ROS 2 / C++), 자율주행 모바일 로봇 SW 및 관제 FMS 개발자
> * **1X Technologies**: Software Engineer - Operating Systems / Core Infrastructure
> * **삼성전자 / LG전자**: 미래로봇 SW 시스템 개발자, CLOi 로봇 솔루션 SW 개발자
> 
> 

---

## Q1. [개념/이론] Modern C++에서 스마트 포인터(unique_ptr, shared_ptr, weak_ptr)의 특징과 메모리 관리 원리는? [빈출]

* **답변 요약**: RAII 패턴 기반으로 힙 메모리 해제를 자동화함.
* `std::unique_ptr`: 독점 소유권을 가지며 복사 불가능하고 이동(`std::move`)만 가능함. 포인터 자체의 오버헤드가 없음.
* `std::shared_ptr`: 참조 카운팅 제어 블록(Control Block)을 공유하여 자원을 공동 소유하며, 참조 횟수가 0이 될 때 메모리를 해제함.
* `std::weak_ptr`: 참조 카운트를 증가시키지 않고 `shared_ptr`을 관찰하여 상호 순환 참조(Circular Reference)로 인한 메모리 누수를 차단함. 자원 접근 시 `lock()`으로 유효성을 확인함.



---

## Q2. [개념/이론] ROS 2와 ROS 1의 구조적 차이점 및 DDS(Data Distribution Service) 도입의 기술적 이점은? [빈출]

* **답변 요약**: ROS 1의 단일 고장점(SPOF)이었던 `roscore` 마스터 노드를 제거하고, OMG 표준인 DDS 기반 완전 분산 피어 투 피어(P2P) 통신 구조로 전환함. DDS의 QoS(Quality of Service) 정책(Reliability, Durability, History, Deadline 등)을 통해 네트워크 손실 환경이나 실시간 센서 스트리밍 요구조건에 맞춰 통신 계층을 제어할 수 있음.

---

## Q3. [실무/트러블슈팅] Linux 멀티스레드 환경에서 교착 상태(Deadlock) 발생 조건 4가지와 예방 기법은? [빈출]

* **답변 요약**:
* **발생 조건 4가지**: 상호 배제(Mutual Exclusion), 점유 대기(Hold and Wait), 비선점(No Preemption), 순환 대기(Circular Wait).
* **예방 기법**: 모든 스레드에서 락 획득 순서를 일원화하여 순환 대기를 차단함. C++11 `std::lock` 또는 C++17 `std::scoped_lock`을 사용하여 여러 뮤텍스를 원자적으로 획득하거나, `try_lock_for` 기반 타임아웃을 적용해 무한 대기를 방지함.



---

## Q4. [시스템/응용] C++ Move Semantics와 우측값 참조(&&)가 로봇 SW 성능 최적화에 미치는 영향은? [빈출]

* **답변 요약**: 라이다 포인트 클라우드, 카메라 고해상도 프레임 등 대용량 데이터 전달 시 깊은 복사(Deep Copy)로 인한 힙 재할당 오버헤드를 제거함. `std::move`를 통해 내부 데이터 포인터의 소유권만 상수 시간 $O(1)$으로 이전하여 제어 루프의 지연 시간(Latency)을 최소화함.

---

## Q5. [개념/이론] ROS 2의 Executor 및 Callback Group(Mutually Exclusive, Reentrant)의 동작 원리는? [빈출]

* **답변 요약**:
* **Executor**: 큐에 들어온 콜백(타이머, 구독자, 서비스 등)을 스케줄링하여 스레드 풀에 분배함.
* **Mutually Exclusive**: 그룹 내 등록된 콜백들이 한 번에 하나씩만 순차 실행되도록 뮤텍스를 적용함. 동일 데이터 동시 접근을 방지함.
* **Reentrant**: 그룹 내 콜백들이 서로 다른 스레드에서 동시에 병렬 실행될 수 있음. 스레드 안전성(Thread-safety) 확보가 필수적임.



---

## Q6. [시스템/응용] Linux 환경에서 Zero-copy 메모리 전달 및 공유 메모리(Shared Memory) 통신 메커니즘은? [빈출]

* **답변 요약**: 프로세스 간 통신(IPC) 시 커널 공간을 경유하는 데이터 복사(`read`/`write` 시 2회 복사)를 배제함. `shm_open` 및 `mmap`으로 물리 메모리 영역을 두 프로세스의 가상 주소 공간에 직접 매핑함. ROS 2에서는 Iceoryx 미들웨어를 DDS 하부 레이어로 결합해 포인트 클라우드 전달 지연을 마이크로초($\mu s$) 단위로 단축함.

---

## Q7. [개념/이론] 객체지향 SOLID 원칙이 로봇 모듈형 SW 아키텍처에 적용되는 구체적 방식은? [빈출]

* **답변 요약**:
* **단일 책임 원칙(SRP)**: 드라이버 I/O 통신 노드와 제어 알고리즘 처리 노드를 명확히 분리함.
* **개방-폐쇄 원칙(OCP)**: 새로운 센서가 추가되어도 공통 센서 인터페이스 상속을 통해 기존 데이터 파이프라인 수정 없이 확장함.
* **의존성 역전 원칙(DIP)**: 상위 제어 로직이 특정 모터 제조사 라이브러리에 직접 의존하지 않고 추상화된 액추에이터 인터페이스(HAL)에 의존하도록 설계함.



---

## Q8. [실무/트러블슈팅] C++ 메모리 단편화(Memory Fragmentation) 억제 및 실시간 제어를 위한 커스텀 메모리 풀(Memory Pool) 설계법은? [빈출]

* **답변 요약**: 실시간 제어 루프 내부에서 `new`/`delete`를 반복 호출하면 힙 단편화가 발생하고 OS 할당 지연으로 실시간성(Determinism)이 깨짐. 초기화 단계에서 고정 크기 블록(Fixed-size Chunk)들을 Free List 구조로 연속된 메모리 공간에 미리 할당하고, 런타임에는 $O(1)$ 시간 복잡도로 블록 포인터만 반환/회수하도록 구현함.

---

## Q9. [시스템/응용] 대규모 C++ 프로젝트에서 모던 CMake의 타겟 기반(Target-based) 빌드 시스템 구성법은? [빈출]

* **답변 요약**: 전역 변수 설정(`include_directories`, `link_libraries`)을 배제하고, `add_library` 및 `add_executable`로 생성된 타겟에 의존성을 직접 부여함. `target_include_directories`와 `target_link_libraries`에 `PUBLIC`(자신 및 외부 노출), `PRIVATE`(내부 전용), `INTERFACE`(헤더 온리) 스코프를 명시하여 모듈 간 캡슐화와 독립성을 유지함.

---

## Q10. [개념/이론] Linux IPC 방식(Socket, Pipe, Shared Memory, Message Queue)의 장단점 및 선택 기준은? [빈출]

* **답변 요약**:
* **대용량 고속 데이터**: 복사 오버헤드가 없는 **공유 메모리(Shared Memory)** 선택.
* **분산 환경 및 확장성**: 서로 다른 하드웨어/네트워크 간 통신이 필요한 경우 **TCP/UDP Socket** 또는 **DDS** 선택.
* **단방향 스트리밍/경량 제어**: 부모-자식 프로세스 간 단순 스트림은 **Named Pipe(FIFO)**, 이벤트성 메시지는 **POSIX Message Queue** 선택.



---

## Q11. [실무/트러블슈팅] GoogleTest(gtest) 및 gmock을 활용한 로봇 제어 SW 단위 테스트(Unit Test) 구축법은? [빈출]

* **답변 요약**: 실제 로봇 하드웨어가 없는 환경 검증을 위해, 하드웨어 인터페이스 순수 가상 함수를 `MOCK_METHOD` 매크로로 재정의함. `EXPECT_CALL`을 통해 특정 명령값(토크, 각속도) 전달 여부와 반환값을 모사(Mocking)하여, 통신 오류나 비정상 인코더 피드백 수신 시 상위 제어기의 Failsafe 방어 로직을 독립 검증함.

---

## Q12. [개념/이론] ROS 2 Lifecycle Node의 상태 전이(Unconfigured, Inactive, Active, Finalized) 목적은? [빈출]

* **답변 요약**: 노드의 초기화, 파라미터 로딩, 통신 연결, 실행 라이프사이클을 명시적으로 제어하여 시스템 결정성을 보장함. 하드웨어 드라이버가 준비되지 않은 상태에서 모터가 급발진하는 사고를 방지하며, 문제 발생 시 시스템 전체 중단 없이 특정 서브시스템 노드만 `Inactive`로 내려 재설정(`Configuring`)할 수 있음.

---

## Q13. [시스템/응용] 로봇 SW 개발 시 Gitflow 브랜치 전략과 CI/CD 파이프라인 자동화 구성 방식은? [빈출]

* **답변 요약**: `main`(배포), `develop`(통합), `feature`(기능 개발) 브랜치로 분리 운용함. PR(Pull Request) 생성 시 GitHub Actions/Jenkins에서 Docker 컨테이너를 가동하여 정적 분석(cppcheck, clang-tidy), 코딩 표준 검사, 단위 테스트(colcon test), 빌드 통과 여부를 자동 검증한 뒤 병합(Merge)을 승인함.

---

## Q14. [실무/트러블슈팅] 프로파일링 툴(Valgrind, perf, gprof)을 활용한 제어 루프 병목 및 메모리 누수 추적 사례는? [빈출]

* **답변 요약**: Valgrind Memcheck로 스마트 포인터 순환 참조 및 미해제 힙 블록을 탐지함. 주기 제어가 튀는 현상(Jitter) 분석 시 `perf record`로 CPU 클럭 사이클을 샘플링한 후 FlameGraph를 생성함. 이를 통해 내부 루프에서 빈번하게 호출되던 문자열 변환 및 불필요한 벡터 복사 병목을 특정하여 실행 시간을 단축함.

---

## Q15. [개념/이론] 로봇 소프트웨어 아키텍처에 적용되는 디자인 패턴(Singleton, Factory, State, Observer)의 역할은? [빈출]

* **답변 요약**:
* **Singleton**: 하드웨어 리소스 접근 관리자(CAN 버스 채널 등)의 단일 인스턴스 보장.
* **Factory**: 센서 타입(2D 라이다, 3D 라이다)에 따른 드라이버 객체 생성 캡슐화.
* **State**: 로봇의 작동 상태(대기, 수동, 자율주행, 비상정지) 전이 규칙과 진입/이탈 조건 캡슐화.
* **Observer**: 센서 데이터 갱신 이벤트를 다수의 구독 모듈에 발행하여 결합도(Coupling)를 낮춤.



---

## Q16. [실무/트러블슈팅] C++20 기능(Concepts, Coroutines, Ranges)의 로봇 소프트웨어 적용 이점은? [빈출]

* **답변 요약**:
* **Concepts**: 템플릿 메타프로그래밍 시 기하학 타입(좌표계 변환, 행렬)의 인터페이스 제약 조건을 컴파일 타임에 검증하여 가독성 높은 에러 메시지 제공.
* **Coroutines**: 비동기 I/O 및 로봇 시퀀스 모션(이동 $\rightarrow$ 파지 $\rightarrow$ 복귀)을 복잡한 콜백 중첩 없이 동기식 코드 형태의 상태 머신으로 작성.
* **Ranges**: 센서 필터링 파이프라인(예: 특정 거리 이내 포인트 필터링)을 임시 컨테이너 생성 없이 파이프라인 연산자(`|`)로 지연 평가(Lazy Evaluation) 처리.



---

## Q17. [시스템/응용] Linux 실시간 스케줄링(SCHED_FIFO, SCHED_RR)과 캐시 미스(Cache Miss) 방지 기법은? [빈출]

* **답변 요약**: 제어 스레드에 RT-PREEMPT 커널 기반 `SCHED_FIFO` 우선순위를 부여하고, CPU Affinity(`pthread_setaffinity_np`)를 통해 제어 전용 코어에 스레드를 격리함. 자료구조 설계 시 Structure of Arrays(SoA) 구조를 채택하거나 64바이트 캐시 라인 크기에 맞춰 `alignas` 정렬을 적용하여 공간 지역성(Spatial Locality)을 확보하고 캐시 미스를 억제함.

---

## Q18. [개념/이론] ROS 2 Component Node(Composable Node)의 구조와 IPC 오버헤드 감소 원리는? [빈출]

* **답변 요약**: 각 노드를 독립 실행 파일(Executable)로 빌드하지 않고 공유 라이브러리(`.so`) 형태의 클래스로 구성함. 단일 컨테이너 프로세스(`rclcpp_components`)에 동적으로 로드함으로써, 프로세스 간 컨텍스트 스위칭 없이 동일 프로세스 주소 공간 내에서 `std::shared_ptr` 포인터 전달만으로 무복사(Zero-copy) 통신을 구현함.

---

## Q19. [실무/트러블슈팅] 멀티스레드 로봇 제어 환경에서 Thread-safe한 비동기 로깅 시스템 구축법은? [빈출]

* **답변 요약**: 1kHz 수준의 실시간 제어 루프 내에서 파일 I/O나 콘솔 출력을 직접 수행하면 디스크 쓰기 지연으로 실시간성이 깨짐. `spdlog`와 같은 비동기 로거를 도입하여 제어 스레드는 고정 크기 비동기 링 버퍼(Lock-free Queue)에 로그 메시지만 밀어 넣고 즉시 복귀하며, 실제 디스크 플러시는 우선순위가 낮은 별도 백그라운드 I/O 스레드가 처리하도록 분리함.

---

## Q20. [시스템/응용] 로봇 SW 아키텍처에서 하드웨어 추상화 계층(HAL - Hardware Abstraction Layer) 구축의 필요성은? [빈출]

* **답변 요약**: 상위 미션/경로 계획 알고리즘과 하위 모터/센서 통신 프로토콜(CAN, EtherCAT 등) 간의 결합도를 완전히 분리함. 하드웨어 드라이버 인터페이스를 순수 가상 클래스(Pure Virtual Class)로 정의함으로써, 모터 드라이버나 액추에이터 하드웨어가 변경되더라도 상위 제어 소프트웨어 코드의 재작성 없이 플러그인 형태로 교체 적용할 수 있음.
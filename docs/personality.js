// Independent, unvalidated self-reflection exercise. Answers stay in memory only.
const personalityPractice = (() => {
    const choices = ['매우 아니다', '아니다', '약간 아니다', '약간 그렇다', '그렇다', '매우 그렇다'];
    const pageSize = 5;
    let active = null;

    function parse(markdown) {
        const tables = marked.lexer(markdown).filter(token => token.type === 'table');
        function rows(headers) {
            const table = tables.find(t => t.header.map(cell => cell.text.trim()).join('|') === headers.join('|'));
            if (!table) throw new Error('Missing personality table');
            return table.rows.map(row => row.map(cell => cell.text.trim()));
        }
        const dimensions = rows(['영역', '낮은 쪽', '높은 쪽', '돌아볼 질문'])
            .map(([name, low, high, reflection]) => ({ name, low, high, reflection }));
        const questions = rows(['ID', '영역', '방향', '문항'])
            .map(([id, dimension, direction, text]) => ({ id, dimension, direction, text }));
        const names = new Set(dimensions.map(d => d.name));
        if (!dimensions.length || dimensions.some(d => Object.values(d).some(v => !v)) || names.size !== dimensions.length
            || !questions.length || new Set(questions.map(q => q.id)).size !== questions.length
            || questions.some(q => !q.id || !q.text || !names.has(q.dimension) || !['정방향', '역방향'].includes(q.direction))
            || dimensions.some(d => questions.filter(q => q.dimension === d.name).length < 2)) {
            throw new Error('Invalid personality questions');
        }
        return { questions, dimensions };
    }

    function summarize(data, answers) {
        if (data.questions.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 1 || answers[q.id] > choices.length)) {
            throw new Error('Incomplete personality answers');
        }
        return data.dimensions.map(d => {
            const items = data.questions.filter(q => q.dimension === d.name);
            const average = items.reduce((sum, q) => sum + (q.direction === '역방향' ? 7 - answers[q.id] : answers[q.id]), 0) / items.length;
            return { ...d, average, score: Math.round((average - 1) / 5 * 100) };
        });
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function button(text, action, kind = 'secondary') {
        const node = element('button', text, `personality-button ${kind}`);
        node.type = 'button';
        node.addEventListener('click', action);
        return node;
    }

    function reset() {
        if (!active) return;
        const state = active;
        active = null;
        state.answers = {};
        clearInterval(state.timer);
        state.container.classList.remove('personality-active');
        state.box.remove();
    }

    function mount(container) {
        reset();
        const box = element('section', '', 'personality-practice');
        box.setAttribute('aria-label', '모의인성검사');
        const state = { container, box, answers: {}, data: null, index: 0, timer: null, startedAt: 0, elapsed: 0 };
        active = state;
        const title = container.querySelector('h1');
        if (title) title.after(box);
        else container.prepend(box);

        function focusHeading() {
            const heading = box.querySelector('h2');
            heading.tabIndex = -1;
            heading.focus({ preventScroll: true });
            box.scrollIntoView({ block: 'start' });
        }

        function intro(focus = false) {
            clearInterval(state.timer);
            state.answers = {};
            state.index = 0;
            container.classList.remove('personality-active');
            box.replaceChildren(
                element('h2', '나의 업무 성향, 가볍게 돌아보기'),
                element('p', '한 페이지에 5문항씩, 6단계 척도로 응답함. 문항 수는 시작 시 안내되며 시간 제한은 없음.'),
                element('p', '자체 제작한 자기점검 연습임. 검증된 심리검사나 채용 합격·직무 적합성 판단 도구가 아님.', 'personality-note'),
                element('p', '응답은 저장·전송하지 않음. 다른 화면으로 이동하거나 새로고침하면 응답이 사라짐.', 'personality-note'),
                button('모의인성검사 하기', load, 'primary')
            );
            if (focus) box.querySelector('button').focus();
        }

        async function load() {
            container.classList.add('personality-active');
            box.replaceChildren(element('p', '문항을 불러오는 중임…'));
            box.setAttribute('aria-busy', 'true');
            try {
                const markdown = await fetchMarkdown(PERSONALITY_DATA);
                if (active !== state || !box.isConnected) return;
                state.data = parse(markdown);
                begin();
            } catch (error) {
                if (active !== state || !box.isConnected) return;
                box.replaceChildren(element('p', '문항을 불러오지 못했음. 연결 상태나 문항 파일을 확인한 뒤 다시 시도해 주세요.'));
                box.firstChild.setAttribute('role', 'alert');
                box.append(button('다시 시도', load, 'primary'), button('인성검사 안내로 돌아가기', () => intro(true)));
            } finally {
                box.removeAttribute('aria-busy');
            }
        }

        function begin() {
            clearInterval(state.timer);
            state.answers = {};
            state.index = 0;
            state.elapsed = 0;
            state.startedAt = Date.now();
            renderQuestion();
        }

        function timeLabel() {
            const seconds = Math.floor((state.elapsed + Date.now() - state.startedAt) / 1000);
            return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        }

        function renderQuestion() {
            clearInterval(state.timer);
            const { questions } = state.data;
            const pageCount = Math.ceil(questions.length / pageSize);
            const pageQuestions = questions.slice(state.index * pageSize, (state.index + 1) * pageSize);
            const heading = element('h2', '모의인성검사');
            const clock = element('span', '', 'personality-clock');
            const progress = element('progress');
            progress.max = questions.length;
            progress.setAttribute('aria-label', '응답 완료 문항 수');
            const status = element('span', '', 'personality-status');
            status.setAttribute('role', 'status');
            const next = button(state.index === pageCount - 1 ? '결과 보기' : '다음 페이지', () => {
                if (pageQuestions.some(q => !state.answers[q.id])) return;
                if (state.index === pageCount - 1) renderResults();
                else { state.index++; renderQuestion(); }
            }, 'primary');
            function updateProgress() {
                const answered = questions.filter(q => state.answers[q.id]).length;
                progress.value = answered;
                status.textContent = `${Math.round(answered / questions.length * 100)}% · ${answered} / ${questions.length}문항`;
                next.disabled = pageQuestions.some(q => !state.answers[q.id]);
            }
            const top = element('div', '', 'personality-session-head');
            top.append(status, clock);
            const rows = element('div', '', 'personality-question-list');
            pageQuestions.forEach((question, offset) => {
                const fieldset = element('fieldset', '', 'personality-question-row');
                const number = state.index * pageSize + offset + 1;
                const legend = element('legend', `${number}. ${question.text}`);
                fieldset.append(legend);
                const options = element('div', '', 'personality-options');
                choices.forEach((label, i) => {
                    const wrapper = element('label');
                    const input = document.createElement('input');
                    input.type = 'radio';
                    input.name = `personality-${question.id}`;
                    input.value = String(i + 1);
                    input.checked = state.answers[question.id] === i + 1;
                    input.addEventListener('change', () => {
                        state.answers[question.id] = i + 1;
                        updateProgress();
                    });
                    wrapper.append(input, element('span', label));
                    options.append(wrapper);
                });
                fieldset.append(options);
                rows.append(fieldset);
            });
            const previous = button('이전 페이지', () => { state.index--; renderQuestion(); });
            previous.disabled = state.index === 0;
            const pagination = element('div', '', 'personality-pagination');
            pagination.append(previous, element('span', `${state.index + 1} / ${pageCount}페이지`), next);
            box.replaceChildren(heading, top, progress,
                element('p', '최근 행동에 가까운 쪽을 선택함. 현재 페이지의 모든 문항에 응답하면 다음으로 이동할 수 있음.', 'personality-note'),
                rows, pagination, button('그만하고 안내로 돌아가기', () => intro(true), 'quiet'),
                element('p', '시간 제한 없음 · 화면을 나가거나 새로고침하면 응답이 사라짐.', 'personality-note'));
            updateProgress();
            const tick = () => { clock.textContent = `경과 ${timeLabel()}`; };
            tick();
            state.timer = setInterval(tick, 1000);
            focusHeading();
        }

        function radar(results) {
            const ns = 'http://www.w3.org/2000/svg';
            function svgNode(tag, attrs) {
                const node = document.createElementNS(ns, tag);
                Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
                return node;
            }
            const svg = svgNode('svg', { viewBox: '0 0 440 400', role: 'img', 'aria-label': `${results.length}개 영역 응답 환산값과 척도 중간점 50 비교. 상세 수치는 아래 영역별 카드에 제공됨.` });
            const center = [220, 200], radius = 130;
            const point = (i, value) => {
                const angle = -Math.PI / 2 + i * 2 * Math.PI / results.length;
                return [center[0] + Math.cos(angle) * radius * value / 100, center[1] + Math.sin(angle) * radius * value / 100];
            };
            const polygon = values => values.map((v, i) => point(i, v).join(',')).join(' ');
            for (const value of [20, 40, 60, 80, 100]) {
                svg.append(svgNode('polygon', { points: polygon(results.map(() => value)), class: 'radar-grid' }));
                const label = svgNode('text', { x: 225, y: 200 - radius * value / 100, class: 'radar-tick' });
                label.textContent = value;
                svg.append(label);
            }
            results.forEach((d, i) => {
                const [x, y] = point(i, 100);
                svg.append(svgNode('line', { x1: 220, y1: 200, x2: x, y2: y, class: 'radar-grid' }));
                const [tx, ty] = point(i, 128);
                const label = svgNode('text', { x: tx, y: ty, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'radar-label' });
                label.textContent = d.name;
                svg.append(label);
            });
            svg.append(svgNode('polygon', { points: polygon(results.map(() => 50)), class: 'radar-reference' }));
            svg.append(svgNode('polygon', { points: polygon(results.map(d => d.score)), class: 'radar-score' }));
            results.forEach((d, i) => {
                const [x, y] = point(i, d.score);
                svg.append(svgNode('circle', { cx: x, cy: y, r: 4, class: 'radar-dot' }));
            });
            const figure = element('figure', '', 'personality-radar');
            const caption = element('figcaption');
            caption.append(element('span', '● 내 응답 환산값', 'radar-key-score'), element('span', '┄ 척도 중간점 50', 'radar-key-reference'));
            figure.append(caption, svg);
            return figure;
        }

        function renderResults() {
            clearInterval(state.timer);
            state.elapsed += Date.now() - state.startedAt;
            const results = summarize(state.data, state.answers);
            box.replaceChildren(element('h2', '영역별 응답 비교'),
                element('p', '자체 제작한 자기점검 연습의 결과임. 검증된 심리검사나 채용 합격·직무 적합성 판단 도구가 아님.', 'personality-note'),
                radar(results),
                element('p', '0~100은 응답을 환산한 값이며 백분위나 정답률이 아님. 점선 50은 척도의 중간점으로, 다른 응시자의 평균이 아님. 높을수록 좋다는 의미도 없음.', 'personality-note'));
            const grid = element('div', '', 'personality-results');
            results.forEach(d => {
                const card = element('section', '', 'personality-result');
                const head = element('div', '', 'personality-result-head');
                head.append(element('h3', d.name), element('strong', `${d.score} / 100`, 'personality-score'));
                const meter = element('div', '', 'personality-score-track');
                meter.setAttribute('role', 'meter');
                meter.setAttribute('aria-label', `${d.name} 응답 환산값`);
                meter.setAttribute('aria-valuemin', '0'); meter.setAttribute('aria-valuemax', '100');
                meter.setAttribute('aria-valuenow', String(d.score));
                const fill = element('div', '', 'personality-score-fill');
                fill.style.width = `${d.score}%`;
                const marker = element('span', '', 'personality-score-marker');
                marker.style.left = `${d.score}%`;
                meter.append(fill, element('span', '', 'personality-midpoint'), marker);
                const ends = element('div', '', 'personality-score-labels');
                ends.append(element('span', `0 · ${d.low}`), element('span', `100 · ${d.high}`));
                card.append(head, element('p', `척도 중간점 50 · 방향 보정 평균 ${d.average.toFixed(2)} / 6`, 'personality-note'), meter, ends, element('p', d.reflection));
                grid.append(card);
            });
            const actions = element('div', '', 'personality-actions');
            actions.append(button('응답 다시 보기', () => { state.index = 0; state.startedAt = Date.now(); renderQuestion(); }),
                button('처음부터 다시 하기', begin, 'primary'),
                button('인성검사 안내로 돌아가기', () => intro(true), 'quiet'));
            box.append(grid, element('p', '평균은 서로 다른 응답을 요약한 값임. 상황에 따라 행동이 달랐는지 개별 답변과 실제 경험도 함께 살펴볼 것.'), actions);
            focusHeading();
        }
        intro();
    }
    return { mount, reset, parse, summarize };
})();

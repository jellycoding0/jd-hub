// Independent, unvalidated self-reflection exercise. Answers stay in memory only.
const personalityPractice = (() => {
    const choices = ['전혀 그렇지 않다', '그렇지 않은 편이다', '보통이다', '그런 편이다', '매우 그렇다'];
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
        if (data.questions.some(q => !Number.isInteger(answers[q.id]) || answers[q.id] < 1 || answers[q.id] > 5)) {
            throw new Error('Incomplete personality answers');
        }
        return data.dimensions.map(d => {
            const items = data.questions.filter(q => q.dimension === d.name);
            const average = items.reduce((sum, q) => sum + (q.direction === '역방향' ? 6 - answers[q.id] : answers[q.id]), 0) / items.length;
            return { ...d, average };
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
        state.container.classList.remove('personality-active');
        state.box.remove();
    }

    function mount(container) {
        reset();
        const box = element('section', '', 'personality-practice');
        box.setAttribute('aria-label', '모의인성검사');
        const state = { container, box, answers: {}, data: null, index: 0 };
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
            state.answers = {};
            state.index = 0;
            container.classList.remove('personality-active');
            box.replaceChildren(
                element('h2', '나의 업무 성향, 가볍게 돌아보기'),
                element('p', '5점 척도로 응답하며 인성검사 형식을 연습함. 문항 수는 시작 시 안내되며 시간 제한은 없음.'),
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
                state.answers = {};
                state.index = 0;
                renderQuestion();
            } catch (error) {
                if (active !== state || !box.isConnected) return;
                box.replaceChildren(element('p', '문항을 불러오지 못했음. 연결 상태나 문항 파일을 확인한 뒤 다시 시도해 주세요.'));
                box.firstChild.setAttribute('role', 'alert');
                box.append(button('다시 시도', load, 'primary'), button('인성검사 안내로 돌아가기', () => intro(true)));
            } finally {
                box.removeAttribute('aria-busy');
            }
        }

        function renderQuestion() {
            const { questions } = state.data;
            const question = questions[state.index];
            const count = questions.filter(q => state.answers[q.id]).length;
            const heading = element('h2', `모의인성검사 · ${state.index + 1} / ${questions.length}`);
            const progress = element('progress');
            progress.max = questions.length;
            progress.value = count;
            progress.setAttribute('aria-label', '응답 완료 문항 수');
            const fieldset = element('fieldset');
            fieldset.append(element('legend', question.text));
            const options = element('div', '', 'personality-options');
            const next = button(state.index === questions.length - 1 ? '결과 보기' : '다음 질문', () => {
                if (!state.answers[question.id]) return;
                if (state.index === questions.length - 1) renderResults();
                else { state.index += 1; renderQuestion(); }
            }, 'primary');
            next.disabled = !state.answers[question.id];
            choices.forEach((label, i) => {
                const wrapper = element('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'personality-answer';
                input.value = String(i + 1);
                input.checked = state.answers[question.id] === i + 1;
                input.addEventListener('change', () => {
                    state.answers[question.id] = i + 1;
                    next.disabled = false;
                    const answered = questions.filter(q => state.answers[q.id]).length;
                    progress.value = answered;
                    status.textContent = `${answered} / ${questions.length}문항 응답 완료`;
                });
                wrapper.append(input, element('span', `${i + 1} · ${label}`));
                options.append(wrapper);
            });
            fieldset.append(options);
            const status = element('p', `${count} / ${questions.length}문항 응답 완료`, 'personality-note');
            status.setAttribute('role', 'status');
            const previous = button('이전 질문', () => { state.index -= 1; renderQuestion(); });
            previous.disabled = state.index === 0;
            const actions = element('div', '', 'personality-actions');
            actions.append(previous, next, button('그만하고 안내로 돌아가기', () => intro(true), 'quiet'));
            box.replaceChildren(heading, element('p', '최근 수업·프로젝트·업무에서 보인 행동을 떠올려 선택함. 판단하기 어렵다면 보통을 선택할 수 있음.'), progress, status, fieldset, actions,
                element('p', '화면을 나가면 응답이 사라짐. 다시 시작할 때는 처음부터 응답함.', 'personality-note'));
            focusHeading();
        }

        function renderResults() {
            const results = summarize(state.data, state.answers);
            box.replaceChildren(element('h2', '나의 응답 돌아보기'),
                element('p', '이번 응답을 영역별로 요약한 결과임. 검증된 심리검사 결과가 아니며, 합격 가능성이나 직무 적합성·고정된 성격 유형을 뜻하지 않음.'),
                element('p', '수치는 방향을 맞춰 계산한 자기응답 평균임. 높을수록 좋은 점수가 아니며 다른 사람과 비교한 순위도 아님. 중간값은 상황별 차이나 보통 응답이 섞인 결과일 수 있음.', 'personality-note'));
            const grid = element('div', '', 'personality-results');
            results.forEach(d => {
                const card = element('section', '', 'personality-result');
                const meter = element('meter');
                meter.min = 1; meter.max = 5; meter.value = d.average;
                meter.setAttribute('aria-label', `${d.name}: ${d.low}에서 ${d.high} 방향, 평균 ${d.average.toFixed(1)}`);
                card.append(element('h3', d.name), element('p', `자기응답 평균 ${d.average.toFixed(1)} / 5`), meter,
                    element('p', `1 · ${d.low} ↔ 5 · ${d.high}`, 'personality-note'),
                    element('p', d.reflection));
                grid.append(card);
            });
            const actions = element('div', '', 'personality-actions');
            actions.append(button('응답 다시 보기', () => { state.index = 0; renderQuestion(); }),
                button('처음부터 다시 하기', () => { state.answers = {}; state.index = 0; renderQuestion(); }, 'primary'),
                button('인성검사 안내로 돌아가기', () => intro(true), 'quiet'));
            box.append(grid, element('p', '각 영역에서 실제 경험 하나를 떠올려 보세요. 프로젝트의 위험·기한·상대에 따라 적절한 행동은 달라질 수 있음.'), actions);
            focusHeading();
        }
        intro();
    }
    return { mount, reset, parse, summarize };
})();

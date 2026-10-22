// Self-guided practice only: drafts are never executed or sent to a server.
const codingPractice = (() => {
    let active = null;

    function parse(markdown) {
        const sections = markdown.replace(/\r\n?/g, '\n').split(/^## /m).slice(1);
        const questions = sections.map(section => {
            const newline = section.indexOf('\n');
            const [id, title, level, minutesText] = section.slice(0, newline).split('|').map(s => s.trim());
            const body = section.slice(newline + 1);
            const split = body.indexOf('### 해설\n');
            const minutes = Number(minutesText);
            if (!/^C\d+$/.test(id || '') || !title || !['기초', '응용'].includes(level)
                || !Number.isInteger(minutes) || minutes < 1 || minutes > 120 || split < 1
                || !body.includes('```python\n') || !body.includes('```cpp\n')) {
                throw new Error('Invalid coding question');
            }
            return { id, title, level, minutes, problem: body.slice(0, split), solution: body.slice(split) };
        });
        if (!questions.length || new Set(questions.map(q => q.id)).size !== questions.length) throw new Error('Invalid question IDs');
        return questions;
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }
    function button(text, action, primary = false) {
        const node = element('button', text, primary ? 'practice-primary' : 'personality-button secondary');
        node.type = 'button';
        node.addEventListener('click', action);
        return node;
    }
    function pause(state) {
        if (state.running) state.running.elapsed += Math.max(0, Date.now() - state.startedAt);
        state.running = null;
        clearInterval(state.timer);
    }
    function reset() {
        if (!active) return;
        pause(active);
        active.container.replaceChildren();
        active = null;
    }
    function mount(container) {
        reset();
        const state = { container, questions: [], attempts: {}, running: null, timer: null, startedAt: 0 };
        active = state;

        function focusTitle() {
            const title = container.querySelector('h2');
            title.tabIndex = -1;
            title.focus({ preventScroll: true });
            container.scrollIntoView({ block: 'start' });
        }
        async function load() {
            container.replaceChildren(element('p', '문제를 불러오는 중임…'));
            container.setAttribute('aria-busy', 'true');
            try {
                const markdown = await fetchMarkdown(CODING_TEST_DATA);
                if (active !== state) return;
                state.questions = parse(markdown);
                list();
            } catch (error) {
                if (active !== state) return;
                const message = element('p', '문제를 불러오지 못했음. 연결 상태나 문항 파일을 확인해 주세요.');
                message.setAttribute('role', 'alert');
                container.replaceChildren(message, button('다시 시도', load));
            } finally {
                if (active === state) container.removeAttribute('aria-busy');
            }
        }
        function list() {
            pause(state);
            const completed = Object.values(state.attempts).filter(a => a.completed).length;
            container.replaceChildren(
                element('h2', '모의 코딩테스트'),
                element('p', '자체 제작 연습 문제임. 실제 기업 기출이 아니며 자동 실행·채점은 제공하지 않음.'),
                element('p', '문제를 선택해 풀이를 작성하거나 개인 IDE에서 실행한 뒤 해설과 비교할 것. 다른 탭으로 이동하거나 새로고침하면 풀이가 사라짐.', 'coding-note'),
                element('p', `총 ${state.questions.length}문제 · 연습 완료 ${completed}개 (자기 확인 기준)`, 'coding-progress')
            );
            const grid = element('div', '', 'coding-question-list');
            for (const q of state.questions) {
                const attempt = state.attempts[q.id];
                const item = button(`${q.id} · ${q.title} — ${q.level} · ${q.minutes}분${attempt?.completed ? ' · 완료' : attempt ? ' · 이어 풀기' : ''}`, () => open(q));
                item.dataset.question = q.id;
                grid.append(item);
            }
            container.append(grid);
            focusTitle();
        }
        function open(q) {
            pause(state);
            const attempt = state.attempts[q.id] ||= { drafts: { python: '', cpp: '' }, language: 'python', elapsed: 0, completed: false, revealed: false };
            const back = button('← 문제 목록으로', list);
            back.className = 'back-navigation';
            container.replaceChildren(element('h2', `${q.id} · ${q.title}`), back);
            const status = element('p', '', 'coding-timer');
            status.setAttribute('role', 'timer');
            status.setAttribute('aria-label', '남은 연습 시간');
            const timeNotice = element('p', '', 'coding-note');
            timeNotice.setAttribute('role', 'status');
            const problem = element('div', '', 'markdown-body coding-problem');
            problem.innerHTML = marked.parse(q.problem);
            const languageLabel = element('label', '풀이 언어');
            const language = element('select');
            language.id = 'coding-language';
            languageLabel.htmlFor = language.id;
            language.add(new Option('Python', 'python'));
            language.add(new Option('C++', 'cpp'));
            language.value = attempt.language;
            const label = element('label', '내 풀이 (코드 또는 접근 방법)');
            const draft = element('textarea');
            draft.id = 'coding-draft';
            label.htmlFor = draft.id;
            draft.rows = 12;
            draft.spellcheck = false;
            draft.autocapitalize = 'off';
            draft.value = attempt.drafts[attempt.language];
            draft.placeholder = '여기에 풀이를 작성함. 이 코드는 실행·전송되지 않음.';
            draft.addEventListener('input', () => { attempt.drafts[attempt.language] = draft.value; });
            language.addEventListener('change', () => {
                attempt.language = language.value;
                draft.value = attempt.drafts[attempt.language];
            });
            const solution = element('div', '', 'markdown-body coding-solution');
            solution.innerHTML = marked.parse(q.solution);
            solution.hidden = !attempt.revealed;
            const reveal = button(attempt.revealed ? '해설 접기' : '해설 보기', () => {
                attempt.revealed = !attempt.revealed;
                solution.hidden = !attempt.revealed;
                reveal.textContent = attempt.revealed ? '해설 접기' : '해설 보기';
                reveal.setAttribute('aria-expanded', String(attempt.revealed));
            });
            reveal.setAttribute('aria-expanded', String(attempt.revealed));
            const complete = button(attempt.completed ? '연습 완료됨' : '연습 완료', () => {
                pause(state);
                attempt.completed = true;
                complete.disabled = true;
                complete.textContent = '연습 완료됨';
                attempt.revealed = true;
                solution.hidden = false;
                reveal.textContent = '해설 접기';
                reveal.setAttribute('aria-expanded', 'true');
                tick();
            }, true);
            complete.disabled = attempt.completed;
            const actions = element('div', '', 'coding-actions');
            actions.append(complete, reveal);
            container.append(status, timeNotice, problem, languageLabel, language, label, draft,
                element('p', '시간 종료 후에도 풀이 가능함. 완료 표시는 정답 판정이 아님.', 'coding-note'), actions, solution);
            if (!attempt.completed) {
                state.running = attempt;
                state.startedAt = Date.now();
                state.timer = setInterval(tick, 1000);
            }
            function tick() {
                const elapsed = attempt.elapsed + (state.running === attempt ? Math.max(0, Date.now() - state.startedAt) : 0);
                const remaining = Math.max(0, Math.ceil((q.minutes * 60000 - elapsed) / 1000));
                status.textContent = `${q.level} · ${attempt.completed ? '연습 완료' : '남은 시간'} ${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`;
                const notice = remaining === 0 ? '권장 시간이 끝났음. 풀이를 계속하거나 해설과 비교할 수 있음.' : '';
                if (timeNotice.textContent !== notice) timeNotice.textContent = notice;
                if (remaining === 0) clearInterval(state.timer);
            }
            tick();
            focusTitle();
        }
        load();
    }
    return { mount, reset, parse };
})();

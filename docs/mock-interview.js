// Questions and answers come from the currently loaded interview document.
const mockInterview = (() => {
    let questions = [];
    let selected = [];
    let category = '';
    let index = 0;
    const toolbar = document.getElementById('mock-interview-toolbar');
    const start = document.getElementById('mock-interview-start');
    const panel = document.getElementById('mock-interview-panel');
    const reference = document.getElementById('interview-reference-card');

    function button(label, action) {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'btn-shortcut-interview';
        element.textContent = label;
        element.addEventListener('click', action);
        return element;
    }

    function close() {
        panel.hidden = true;
        panel.replaceChildren();
        reference.hidden = false;
        toolbar.hidden = questions.length === 0;
    }

    function reset(nextCategory, enabled) {
        questions = [];
        selected = [];
        category = nextCategory;
        close();
        toolbar.hidden = !enabled;
        start.disabled = true;
    }

    function ready(container) {
        questions = Array.from(container.querySelectorAll('.interview-qna-card')).map(card => ({
            title: card.querySelector('.qna-title-text').textContent,
            answer: card.querySelector('.qna-answer-body').cloneNode(true)
        }));
        start.disabled = questions.length === 0;
    }

    function render() {
        panel.replaceChildren();
        const heading = document.createElement('h3');
        heading.tabIndex = -1;
        const progress = document.createElement('p');
        progress.className = 'mock-interview-progress';
        const actions = document.createElement('div');
        actions.className = 'mock-interview-actions';
        panel.append(progress, heading);

        if (index === selected.length) {
            progress.textContent = `${category} 모의면접`;
            heading.textContent = `${selected.length}문항 연습 완료`;
            actions.append(button('다시 시작', begin), button('기출 목록으로 돌아가기', () => {
                close();
                start.focus();
            }));
        } else {
            const question = selected[index];
            progress.textContent = `${category} · ${index + 1} / ${selected.length}`;
            heading.textContent = question.title;
            const details = document.createElement('details');
            details.className = 'mock-interview-answer';
            const summary = document.createElement('summary');
            summary.textContent = '모범 답안 보기';
            const answer = document.createElement('div');
            answer.className = 'markdown-body';
            answer.append(...question.answer.cloneNode(true).childNodes);
            details.append(summary, answer);
            details.addEventListener('toggle', () => {
                summary.textContent = details.open ? '모범 답안 접기' : '모범 답안 보기';
            });
            panel.append(details);
            actions.append(
                button(index === selected.length - 1 ? '완료 · 면접 마치기' : '완료 · 다음 질문', () => {
                    index += 1;
                    render();
                }),
                button('기출 목록으로 돌아가기', () => {
                    close();
                    start.focus();
                })
            );
        }
        panel.append(actions);
        heading.focus({ preventScroll: true });
        panel.scrollIntoView({ block: 'start', behavior: 'instant' });
    }

    function begin() {
        if (!questions.length) return;
        const shuffled = [...questions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        selected = shuffled.slice(0, 5);
        index = 0;
        toolbar.hidden = true;
        reference.hidden = true;
        panel.hidden = false;
        render();
    }

    start.addEventListener('click', begin);
    return { reset, ready };
})();

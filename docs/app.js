// Main State
let activeTags = new Set();
let activeCompanies = new Set();
let activeYears = new Set();
let activeCareers = new Set();
let searchQuery = "";
let sortBy = "latest";

// DOM Elements
const jobsGrid = document.getElementById('jobs-grid');
const tagCloud = document.getElementById('tag-cloud');
const companyFilterList = document.getElementById('company-filter-list');
const careerFilterList = document.getElementById('career-filter-list');
const yearFilterList = document.getElementById('year-filter-list');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const resultsCount = document.getElementById('results-count');
const btnClearCompanies = document.getElementById('btn-clear-companies');

// Detail Panel DOMs
const detailPanel = document.getElementById('detail-panel');
const panelOverlay = document.getElementById('panel-overlay');
const btnClosePanel = document.getElementById('btn-close-panel');
const detailCompany = document.getElementById('detail-company');
const detailTitle = document.getElementById('detail-title');
const detailTags = document.getElementById('detail-tags');
const detailMarkdown = document.getElementById('detail-markdown');

// Stats DOMs
const statCompanies = document.getElementById('stat-companies');
const statJds = document.getElementById('stat-jds');

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Configure marked options & link renderer (open in new tab)
    const renderer = new marked.Renderer();
    const defaultLinkRenderer = renderer.link.bind(renderer);
    renderer.link = (href, title, text) => {
        let linkUrl = href;
        if (typeof href === 'object' && href !== null) {
            linkUrl = href.href;
            text = href.text;
            title = href.title;
        }
        const html = defaultLinkRenderer(linkUrl, title, text);
        return html.replace(/^<a /, '<a target="_blank" rel="noopener noreferrer" ');
    };

    marked.setOptions({
        breaks: true,
        gfm: true,
        renderer: renderer
    });

    initFilters();
    renderJobs();
    updateGlobalStats();
    initTabNavigation();
    initInterviewView();
    initMobileFilterModal();
    
    // Bind Event Listeners
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase().trim();
            renderJobs();
        });
    }
    
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            renderJobs();
        });
    }
    
    if (btnClearCompanies) {
        btnClearCompanies.addEventListener('click', () => {
            activeCompanies.clear();
            document.querySelectorAll('.company-checkbox').forEach(cb => cb.checked = false);
            renderJobs();
        });
    }

    if (btnClosePanel) btnClosePanel.addEventListener('click', closeDetailPanel);
    if (panelOverlay) panelOverlay.addEventListener('click', closeDetailPanel);

    // Bind Guide Button
    const btnShowGuide = document.getElementById('btn-show-guide');
    if (btnShowGuide) {
        btnShowGuide.addEventListener('click', () => {
            const guideJob = JOBS_DATA.find(j => j.is_guide);
            if (guideJob) {
                openDetailPanel(guideJob);
                if (typeof gtag === 'function') {
                    gtag('event', 'click_guide_button', {
                        'event_category': 'academic_guide',
                        'event_label': '전공강의_수강_가이드'
                    });
                }
            }
        });
    }
});

// Mobile Bottom Sheet Filter Modal Controller
function initMobileFilterModal() {
    const btnOpenMobileFilter = document.getElementById('btn-open-mobile-filter');
    const btnCloseMobileFilter = document.getElementById('btn-close-mobile-filter');
    const btnApplyMobileFilter = document.getElementById('btn-apply-mobile-filter');
    const btnClearAllMobile = document.getElementById('btn-clear-all-mobile');
    const mobileBackdrop = document.getElementById('mobile-filter-backdrop');
    const appSidebar = document.getElementById('app-sidebar');

    const openModal = () => {
        if (appSidebar) appSidebar.classList.add('mobile-active');
        if (mobileBackdrop) mobileBackdrop.classList.add('active');
        document.body.classList.add('mobile-filter-open');
    };

    const closeModal = () => {
        if (appSidebar) appSidebar.classList.remove('mobile-active');
        if (mobileBackdrop) mobileBackdrop.classList.remove('active');
        document.body.classList.remove('mobile-filter-open');
    };

    if (btnOpenMobileFilter) btnOpenMobileFilter.addEventListener('click', openModal);
    if (btnCloseMobileFilter) btnCloseMobileFilter.addEventListener('click', closeModal);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeModal);
    if (btnApplyMobileFilter) {
        btnApplyMobileFilter.addEventListener('click', () => {
            renderJobs();
            closeModal();
        });
    }

    if (btnClearAllMobile) {
        btnClearAllMobile.addEventListener('click', () => {
            activeTags.clear();
            activeCompanies.clear();
            activeYears.clear();
            activeCareers.clear();
            document.querySelectorAll('.company-checkbox').forEach(cb => cb.checked = false);
            document.querySelectorAll('.tag-pill').forEach(pill => pill.classList.remove('active'));
            renderJobs();
        });
    }

    // Quick Career Filter Chips Event Handler
    const quickChips = document.getElementById('quick-career-chips');
    if (quickChips) {
        quickChips.addEventListener('click', (e) => {
            const chip = e.target.closest('.chip-item');
            if (!chip) return;
            const career = chip.dataset.career;
            if (career === 'all') {
                activeCareers.clear();
            } else {
                if (activeCareers.has(career)) {
                    activeCareers.delete(career);
                } else {
                    activeCareers.clear();
                    activeCareers.add(career);
                }
            }

            // Sync sidebar career tag pills
            document.querySelectorAll('#career-filter-list .tag-pill').forEach(pill => {
                const text = pill.dataset.career || pill.textContent.replace(/[\d()\s]/g, '').trim();
                if (activeCareers.has(text)) {
                    pill.classList.add('active');
                } else {
                    pill.classList.remove('active');
                }
            });

            renderJobs();
        });
    }
}

// Initialize Sidebar Filters
function initFilters() {
    if (typeof JOBS_DATA === 'undefined') return;

    // Filter out intro/guide/lecture/tips/news files from filter counts
    const validJds = JOBS_DATA.filter(j => !j.is_intro && !j.is_guide && !j.is_lecture && !j.is_tips && !j.is_news);

    // 1. Populate Tag Cloud (Exclude career tags from category cloud)
    const tagCounts = {};
    validJds.forEach(job => {
        job.tags.forEach(tag => {
            if (tag !== '신입' && tag !== '경력' && tag !== '신입·경력' && tag !== '신입/경력') {
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            }
        });
    });

    if (tagCloud) {
        tagCloud.innerHTML = '';
        Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]).forEach(tag => {
            const pill = document.createElement('button');
            pill.className = 'tag-pill';
            pill.innerHTML = `<span>${tag}</span><span class="count">${tagCounts[tag]}</span>`;
            pill.addEventListener('click', () => {
                pill.classList.toggle('active');
                if (activeTags.has(tag)) {
                    activeTags.delete(tag);
                } else {
                    activeTags.add(tag);
                }
                renderJobs();
            });
            tagCloud.appendChild(pill);
        });
    }

    // 2. Populate Career Type Filter (신입, 경력)
    const careerCounts = {};
    validJds.forEach(job => {
        job.tags.forEach(tag => {
            if (tag === '신입' || tag === '경력') {
                careerCounts[tag] = (careerCounts[tag] || 0) + 1;
            }
        });
    });

    if (careerFilterList) {
        careerFilterList.innerHTML = '';
        ['신입', '경력'].forEach(career => {
            if (careerCounts[career]) {
                const pill = document.createElement('button');
                const careerClass = career === '신입' ? 'tag-sinip' : 'tag-gyeongryeok';
                pill.className = `tag-pill career-pill ${careerClass}`;
                pill.innerHTML = `<span>${career}</span><span class="count">${careerCounts[career]}</span>`;
                pill.addEventListener('click', () => {
                    pill.classList.toggle('active');
                    if (activeCareers.has(career)) {
                        activeCareers.delete(career);
                    } else {
                        activeCareers.add(career);
                    }
                    renderJobs();
                });
                careerFilterList.appendChild(pill);
            }
        });
    }

    // 3. Populate Year Filter (공고 년도)
    const yearCounts = {};
    validJds.forEach(job => {
        if (job.year) {
            const displayYear = job.year.length === 2 ? `20${job.year}` : job.year;
            yearCounts[displayYear] = (yearCounts[displayYear] || 0) + 1;
        }
    });

    if (yearFilterList) {
        yearFilterList.innerHTML = '';
        Object.keys(yearCounts).sort((a, b) => b.localeCompare(a)).forEach(year => {
            const pill = document.createElement('button');
            pill.className = 'tag-pill year-pill';
            pill.innerHTML = `<span>${year}년</span><span class="count">${yearCounts[year]}</span>`;
            pill.addEventListener('click', () => {
                pill.classList.toggle('active');
                const rawYear = year.replace('20', '');
                if (activeYears.has(rawYear) || activeYears.has(year)) {
                    activeYears.delete(rawYear);
                    activeYears.delete(year);
                } else {
                    activeYears.add(rawYear);
                    activeYears.add(year);
                }
                renderJobs();
            });
            yearFilterList.appendChild(pill);
        });
    }

    // 4. Populate Companies List
    const companyCounts = {};
    validJds.forEach(job => {
        companyCounts[job.company] = (companyCounts[job.company] || 0) + 1;
    });

    if (companyFilterList) {
        companyFilterList.innerHTML = '';
        Object.keys(companyCounts).sort((a, b) => a.localeCompare(b, 'ko')).forEach(company => {
            const item = document.createElement('label');
            item.className = 'company-item';
            item.innerHTML = `
                <input type="checkbox" class="company-checkbox" value="${company}">
                <span class="company-name">${company}</span>
                <span class="company-count">${companyCounts[company]}</span>
            `;
            const checkbox = item.querySelector('input');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    activeCompanies.add(company);
                } else {
                    activeCompanies.delete(company);
                }
                renderJobs();
            });
            companyFilterList.appendChild(item);
        });
    }
}

// Render Jobs Grid
function renderJobs() {
    if (!jobsGrid || typeof JOBS_DATA === 'undefined') return;

    let filtered = JOBS_DATA.filter(job => !job.is_intro && !job.is_guide && !job.is_lecture && !job.is_tips && !job.is_news);

    // Filter by Tags
    if (activeTags.size > 0) {
        filtered = filtered.filter(job => 
            Array.from(activeTags).every(tag => job.tags.includes(tag))
        );
    }

    // Filter by Career Type (신입, 경력)
    if (activeCareers.size > 0) {
        filtered = filtered.filter(job => 
            Array.from(activeCareers).some(career => job.tags.includes(career))
        );
    }

    // Filter by Year (공고년도)
    if (activeYears.size > 0) {
        filtered = filtered.filter(job => {
            if (!job.year) return false;
            const fullYear = job.year.length === 2 ? `20${job.year}` : job.year;
            return activeYears.has(job.year) || activeYears.has(fullYear);
        });
    }

    // Filter by Companies
    if (activeCompanies.size > 0) {
        filtered = filtered.filter(job => activeCompanies.has(job.company));
    }

    // Filter by Search Query
    if (searchQuery) {
        filtered = filtered.filter(job => {
            const searchHaystack = `${job.company} ${job.title} ${job.tags.join(' ')} ${job.raw_content}`.toLowerCase();
            return searchHaystack.includes(searchQuery);
        });
    }

function getJobDateVal(j) {
    if (j.date_val) return j.date_val;
    const raw = j.raw_content || '';
    const title = j.title || '';
    const jid = j.id || '';
    const year = j.year || '';

    const m1 = raw.match(/(?:게시일|발행일자|마감일|마감):\s*(\d{4})[-.\s](\d{1,2})[-.\s](\d{1,2})/);
    if (m1) {
        return `${m1[1]}${String(m1[2]).padStart(2, '0')}${String(m1[3]).padStart(2, '0')}`;
    }

    const m2 = (title + ' ' + jid).match(/\b(2[3-9])(0[1-9]|1[0-2])\b/);
    if (m2) {
        return `20${m2[1]}${m2[2]}00`;
    }

    if (year) {
        const yStr = year.length === 2 ? `20${year}` : year;
        return `${yStr}0000`;
    }

    return '00000000';
}

    // Sort Jobs
    filtered.sort((a, b) => {
        if (sortBy === 'title') {
            return a.title.localeCompare(b.title, 'ko');
        } else if (sortBy === 'company') {
            return a.company.localeCompare(b.company, 'ko');
        } else { // latest (default)
            const dateA = getJobDateVal(a);
            const dateB = getJobDateVal(b);
            if (dateB !== dateA) {
                return dateB.localeCompare(dateA); // Newest first
            }
            const compComp = a.company.localeCompare(b.company, 'ko');
            if (compComp !== 0) return compComp;
            return a.title.localeCompare(b.title, 'ko');
        }
    });

    // Update Results Count & Mobile Badges
    if (resultsCount) {
        resultsCount.innerHTML = `<span class="count-prefix">검색 결과: </span><strong class="count-num">${filtered.length}</strong>개 포지션`;
    }
    
    const mobileResultCount = document.getElementById('mobile-filter-result-count');
    if (mobileResultCount) mobileResultCount.textContent = filtered.length;

    const totalActiveFilters = activeTags.size + activeCompanies.size + activeYears.size + activeCareers.size;
    const mobileBadge = document.getElementById('mobile-active-filter-badge');
    if (mobileBadge) mobileBadge.textContent = totalActiveFilters;

    // Sync Quick Career Filter Chips
    const quickChips = document.getElementById('quick-career-chips');
    if (quickChips) {
        quickChips.querySelectorAll('.chip-item').forEach(chip => {
            const career = chip.dataset.career;
            if (career === 'all') {
                chip.classList.toggle('active', activeCareers.size === 0);
            } else {
                chip.classList.toggle('active', activeCareers.has(career));
            }
        });
    }

    // Render Cards
    jobsGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        jobsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-magnifying-glass"></i>
                <p>조건에 맞는 채용공고가 없습니다.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(job => {
        const card = document.createElement('div');
        card.className = 'job-card';

        // Separate career tags vs job category tags
        const careerTags = [];
        const categoryTags = [];

        (job.tags || []).forEach(t => {
            if (t === '신입' || t === '경력' || t.includes('신입') || t.includes('경력')) {
                careerTags.push(t);
            } else {
                categoryTags.push(t);
            }
        });

        const careerBadgesHtml = careerTags.map(t => {
            let badgeClass = 'card-tag card-tag-career';
            if (t === '신입') badgeClass += ' tag-sinip';
            else if (t === '경력') badgeClass += ' tag-gyeongryeok';
            else badgeClass += ' tag-both';
            return `<span class="${badgeClass}">${t}</span>`;
        }).join('');

        const categoryBadgesHtml = categoryTags.map(t => {
            return `<span class="card-tag card-tag-category">${t}</span>`;
        }).join('');

        let yearBadgeHtml = '';
        if (job.year) {
            const yearStr = job.year.length === 2 ? `20${job.year}` : job.year;
            yearBadgeHtml = `<span class="card-tag-year">${yearStr}년</span>`;
        } else if (job.is_intro) {
            yearBadgeHtml = `<span class="card-badge-intro">소개</span>`;
        }

        card.innerHTML = `
            <div class="card-top">
                <div class="card-header">
                    <span class="card-company">${job.company}</span>
                    ${yearBadgeHtml}
                </div>
                <h3 class="card-title">${job.title}</h3>
            </div>
            <div class="card-bottom">
                <div class="card-tags">
                    ${careerBadgesHtml}
                    ${categoryBadgesHtml}
                </div>
            </div>
        `;

        card.addEventListener('click', () => openDetailPanel(job));
        jobsGrid.appendChild(card);
    });
}

// Open Detail Panel
function openDetailPanel(job) {
    if (!detailCompany || !detailTitle || !detailTags || !detailMarkdown || !detailPanel) return;

    detailCompany.textContent = job.company;
    detailTitle.textContent = job.title;
    
    let yearBadgeHtml = '';
    if (job.year) {
        const yearStr = job.year.length === 2 ? `20${job.year}` : job.year;
        yearBadgeHtml = `<span class="card-tag-year">${yearStr}년 공고</span>`;
    }

    const tagBadges = (job.tags || []).map(t => {
        let badgeClass = 'card-tag';
        if (t === '신입') badgeClass += ' card-tag-career tag-sinip';
        else if (t === '경력') badgeClass += ' card-tag-career tag-gyeongryeok';
        else if (t.includes('신입') || t.includes('경력')) badgeClass += ' card-tag-career tag-both';
        else badgeClass += ' card-tag-category';
        return `<span class="${badgeClass}">${t}</span>`;
    }).join('');
    
    detailTags.innerHTML = yearBadgeHtml + tagBadges;
    
    // Check if any tag matches INTERVIEW_DATA
    if (typeof INTERVIEW_DATA !== 'undefined') {
        const matchedTag = job.tags.find(t => INTERVIEW_DATA[t.trim()]);
        if (matchedTag) {
            const shortcutBtn = document.createElement('button');
            shortcutBtn.className = 'btn-shortcut-interview';
            shortcutBtn.innerHTML = `<i class="fa-solid fa-comments"></i> '${matchedTag}' 관련 면접 기출 질문 보기`;
            shortcutBtn.addEventListener('click', () => {
                closeDetailPanel();
                switchTab('interviews');
                renderInterviewCategory(matchedTag.trim());
            });
            detailTags.appendChild(shortcutBtn);
        }
    }
    
    // Parse Markdown
    detailMarkdown.innerHTML = marked.parse(job.raw_content);
    
    // Show Panel
    detailPanel.classList.add('active');
}

// Close Detail Panel
function closeDetailPanel() {
    if (detailPanel) detailPanel.classList.remove('active');
    renderJobs();
}

// Update Global Dashboard Statistics
function updateGlobalStats() {
    if (!statCompanies || !statJds || typeof JOBS_DATA === 'undefined') return;
    const validJds = JOBS_DATA.filter(j => !j.is_intro && !j.is_guide && !j.is_lecture && !j.is_tips && !j.is_news);
    const uniqueCompanies = new Set(validJds.map(j => j.company));
    statCompanies.textContent = uniqueCompanies.size;
    statJds.textContent = validJds.length;
}

// Main Navigation Tab Switching & Hash Deep Linking
function initTabNavigation() {
    const tabBtnJobs = document.getElementById('tab-btn-jobs');
    const tabBtnInterviews = document.getElementById('tab-btn-interview') || document.getElementById('tab-btn-interviews');
    const tabBtnNews = document.getElementById('tab-btn-news');
    const tabBtnLectures = document.getElementById('tab-btn-lectures');
    const tabBtnQna = document.getElementById('tab-btn-qna');

    const mobileNavJobs = document.getElementById('mobile-nav-jobs');
    const mobileNavInterview = document.getElementById('mobile-nav-interview');
    const mobileNavNews = document.getElementById('mobile-nav-news');
    const mobileNavLectures = document.getElementById('mobile-nav-lectures');
    const mobileNavQna = document.getElementById('mobile-nav-qna');
    
    if (tabBtnJobs) tabBtnJobs.addEventListener('click', () => switchTab('jobs'));
    if (tabBtnInterviews) tabBtnInterviews.addEventListener('click', () => switchTab('interviews'));
    if (tabBtnNews) tabBtnNews.addEventListener('click', () => switchTab('news'));
    if (tabBtnLectures) tabBtnLectures.addEventListener('click', () => switchTab('lectures'));
    if (tabBtnQna) tabBtnQna.addEventListener('click', () => switchTab('qna'));

    if (mobileNavJobs) mobileNavJobs.addEventListener('click', () => switchTab('jobs'));
    if (mobileNavInterview) mobileNavInterview.addEventListener('click', () => switchTab('interviews'));
    if (mobileNavNews) mobileNavNews.addEventListener('click', () => switchTab('news'));
    if (mobileNavLectures) mobileNavLectures.addEventListener('click', () => switchTab('lectures'));
    if (mobileNavQna) mobileNavQna.addEventListener('click', () => switchTab('qna'));

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
}

function handleHashChange() {
    const rawHash = decodeURIComponent(window.location.hash.replace('#', '').trim());
    if (!rawHash) return;

    if (rawHash.startsWith('interviews')) {
        const parts = rawHash.split('/');
        switchTab('interviews', false);
        if (parts.length > 1 && parts[1]) {
            renderInterviewItem(parts[1], false);
        }
    } else if (rawHash.startsWith('news')) {
        const parts = rawHash.split('/');
        switchTab('news', false);
        if (parts.length > 1 && parts[1]) {
            renderNewsItem(parts[1], false);
        }
    } else if (rawHash === 'lectures') {
        switchTab('lectures', false);
    } else if (rawHash === 'qna') {
        switchTab('qna', false);
    } else if (rawHash === 'jobs') {
        switchTab('jobs', false);
    }
}

function switchTab(tabName, updateHash = true) {
    const viewJobs = document.getElementById('view-jobs');
    const viewInterviews = document.getElementById('view-interviews');
    const viewNews = document.getElementById('view-news');
    const viewLectures = document.getElementById('view-lectures');
    const viewQna = document.getElementById('view-qna');
    
    const tabBtnJobs = document.getElementById('tab-btn-jobs');
    const tabBtnInterviews = document.getElementById('tab-btn-interview') || document.getElementById('tab-btn-interviews');
    const tabBtnNews = document.getElementById('tab-btn-news');
    const tabBtnLectures = document.getElementById('tab-btn-lectures');
    const tabBtnQna = document.getElementById('tab-btn-qna');

    const mobileNavItems = {
        jobs: document.getElementById('mobile-nav-jobs'),
        interviews: document.getElementById('mobile-nav-interview'),
        news: document.getElementById('mobile-nav-news'),
        lectures: document.getElementById('mobile-nav-lectures'),
        qna: document.getElementById('mobile-nav-qna')
    };

    if (viewJobs) viewJobs.style.display = 'none';
    if (viewInterviews) viewInterviews.style.display = 'none';
    if (viewNews) viewNews.style.display = 'none';
    if (viewLectures) viewLectures.style.display = 'none';
    if (viewQna) viewQna.style.display = 'none';

    if (tabBtnJobs) tabBtnJobs.classList.remove('active');
    if (tabBtnInterviews) tabBtnInterviews.classList.remove('active');
    if (tabBtnNews) tabBtnNews.classList.remove('active');
    if (tabBtnLectures) tabBtnLectures.classList.remove('active');
    if (tabBtnQna) tabBtnQna.classList.remove('active');

    Object.keys(mobileNavItems).forEach(key => {
        if (mobileNavItems[key]) {
            mobileNavItems[key].classList.toggle('active', key === tabName);
        }
    });

    if (tabName === 'jobs') {
        if (viewJobs) viewJobs.style.display = 'block';
        if (tabBtnJobs) tabBtnJobs.classList.add('active');
        if (updateHash) history.replaceState(null, '', '#jobs');
    } else if (tabName === 'interviews') {
        if (viewInterviews) viewInterviews.style.display = 'block';
        if (tabBtnInterviews) tabBtnInterviews.classList.add('active');
        if (updateHash) history.replaceState(null, '', `#interviews/${encodeURIComponent(currentInterviewCategory)}`);
        initInterviewView();

        if (typeof gtag === 'function') {
            gtag('event', 'click_tab_interviews', {
                'event_category': 'navigation',
                'event_label': '면접기출_및_꿀팁'
            });
        }
    } else if (tabName === 'news') {
        if (viewNews) viewNews.style.display = 'block';
        if (tabBtnNews) tabBtnNews.classList.add('active');
        if (updateHash) history.replaceState(null, '', '#news');
        initNewsView();

        if (typeof gtag === 'function') {
            gtag('event', 'click_tab_news', {
                'event_category': 'navigation',
                'event_label': '로봇_산업_뉴스'
            });
        }
    } else if (tabName === 'lectures') {
        if (viewLectures) viewLectures.style.display = 'block';
        if (tabBtnLectures) tabBtnLectures.classList.add('active');
        if (updateHash) history.replaceState(null, '', '#lectures');
        renderLectureView();

        if (typeof gtag === 'function') {
            gtag('event', 'click_tab_lectures', {
                'event_category': 'navigation',
                'event_label': '로봇_실무_프로젝트_강의'
            });
        }
    } else if (tabName === 'qna') {
        if (viewQna) viewQna.style.display = 'block';
        if (tabBtnQna) tabBtnQna.classList.add('active');
        if (updateHash) history.replaceState(null, '', '#qna');
        initQnaView();

        if (typeof gtag === 'function') {
            gtag('event', 'click_tab_qna', {
                'event_category': 'navigation',
                'event_label': 'QNA'
            });
        }
    }
}

function initQnaView() {
    const wrapper = document.getElementById('giscus-wrapper');
    if (!wrapper) return;
    if (wrapper.querySelector('script')) return;

    const themeUrl = 'https://jellycoding0.github.io/jd-hub/giscus-theme.css';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'jellycoding0/jd-hub');
    script.setAttribute('data-repo-id', 'R_kgDOTm5Ecg');
    script.setAttribute('data-category', 'Q&A');
    script.setAttribute('data-category-id', 'DIC_kwDOTm5Ecs4DFFFl');
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', 'Q&A 게시판');
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '0');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', themeUrl);
    script.setAttribute('data-lang', 'ko');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    wrapper.appendChild(script);
}

// Integrated Interview & Tips View Handler (Separated Sidebars)
let currentInterviewCategory = "실무면접 팁";

function initInterviewView() {
    const tipsCatList = document.getElementById('tips-cat-list');
    const interviewCatList = document.getElementById('interview-cat-list');
    if (!tipsCatList || !interviewCatList || typeof INTERVIEW_DATA === 'undefined') return;

    // 1. Populate Tips Box
    tipsCatList.innerHTML = '';
    const tipsCategories = [
        { name: "전공강의 수강 가이드", isGuide: true },
        { name: "취업전략 팁", key: "취업전략" },
        { name: "서류 & 포트폴리오 팁", key: "서류/포트폴리오" },
        { name: "실무면접 팁", key: "실무면접" },
        { name: "인성검사 팁", key: "인성검사" },
        { name: "코딩테스트 팁", key: "코딩테스트" },
        { name: "인성면접 팁", key: "인성면접" }
    ];

    tipsCategories.forEach(tip => {
        const btn = document.createElement('button');
        btn.className = `interview-cat-btn ${tip.name === currentInterviewCategory ? 'active' : ''}`;
        btn.dataset.category = tip.name;

        let badgeHtml = `<span class="badge-count" style="background: rgba(236,72,153,0.2); color:#f472b6;">TIPS</span>`;
        if (tip.isGuide) {
            badgeHtml = `<span class="badge-count" style="background: rgba(56,189,248,0.2); color:#38bdf8;">ROADMAP</span>`;
        }

        btn.innerHTML = `
            <span>${tip.name}</span>
            ${badgeHtml}
        `;
        btn.addEventListener('click', () => {
            renderInterviewItem(tip.name);
        });
        tipsCatList.appendChild(btn);
    });

    // 2. Populate Technical Interview Categories Box
    interviewCatList.innerHTML = '';
    const qaCategories = Object.keys(INTERVIEW_DATA);
    qaCategories.sort((a, b) => {
        if (a === "공통") return -1;
        if (b === "공통") return 1;
        return a.localeCompare(b, 'ko');
    });

    qaCategories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = `interview-cat-btn ${cat === currentInterviewCategory ? 'active' : ''}`;
        btn.dataset.category = cat;

        const qMatches = INTERVIEW_DATA[cat] ? INTERVIEW_DATA[cat].match(/## Q\d+/g) : null;
        const qCount = qMatches ? qMatches.length : 20;

        btn.innerHTML = `
            <span>${cat}</span>
            <span class="badge-count">${qCount} Qs</span>
        `;
        btn.addEventListener('click', () => {
            renderInterviewItem(cat);
        });
        interviewCatList.appendChild(btn);
    });

    // Initial render
    renderInterviewItem(currentInterviewCategory, false);
}

function renderInterviewItem(catName, updateHash = true) {
    currentInterviewCategory = catName;

    if (updateHash && window.location.hash.includes('interviews')) {
        history.replaceState(null, '', `#interviews/${encodeURIComponent(catName)}`);
    }

    // Update Active Class across both Tips and Job Category Sidebars
    document.querySelectorAll('.interview-sidebar .interview-cat-btn').forEach(btn => {
        if (btn.dataset.category === catName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const selectedTitle = document.getElementById('selected-interview-title');
    const interviewMarkdown = document.getElementById('interview-markdown');

    // Check if it's a Tip or Guide
    const tipKeys = ["전공강의 수강 가이드", "취업전략 팁", "서류 & 포트폴리오 팁", "실무면접 팁", "인성검사 팁", "코딩테스트 팁", "인성면접 팁"];
    if (tipKeys.includes(catName)) {
        if (catName === "전공강의 수강 가이드") {
            if (selectedTitle) {
                selectedTitle.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> 전공강의 수강 가이드`;
            }
            if (interviewMarkdown && typeof JOBS_DATA !== 'undefined') {
                const guideJob = JOBS_DATA.find(j => j.is_guide);
                if (guideJob) {
                    interviewMarkdown.innerHTML = marked.parse(guideJob.raw_content);
                } else {
                    interviewMarkdown.innerHTML = `<h1>전공강의 수강 가이드</h1><p>가이드를 불러오는 중입니다.</p>`;
                }
            }
        } else {
            let subcatKey = catName.replace(' 팁', '');
            if (catName === "서류 & 포트폴리오 팁") subcatKey = "서류/포트폴리오";

            if (selectedTitle) {
                selectedTitle.innerHTML = `<i class="fa-solid fa-lightbulb"></i> ${catName}`;
            }
            if (interviewMarkdown && typeof JOBS_DATA !== 'undefined') {
                const tipJob = JOBS_DATA.find(j => j.is_tips && (j.tip_category === subcatKey || j.tip_category.includes(subcatKey)));
                if (tipJob) {
                    interviewMarkdown.innerHTML = marked.parse(tipJob.raw_content);
                } else {
                    interviewMarkdown.innerHTML = `<h1>${catName}</h1><p>가이드를 불러오는 중입니다.</p>`;
                }
            }
        }
    } else {
        // Technical Interview QA
        if (selectedTitle) {
            selectedTitle.innerHTML = `<i class="fa-solid fa-book-open"></i> ${catName} 직무 면접 기출 질문`;
        }
        if (interviewMarkdown && typeof INTERVIEW_DATA !== 'undefined' && INTERVIEW_DATA[catName]) {
            interviewMarkdown.innerHTML = marked.parse(INTERVIEW_DATA[catName]);
            enhanceInterviewDOM(interviewMarkdown);
        }
    }

    const interviewContent = document.querySelector('.interview-content');
    if (interviewContent) {
        interviewContent.scrollTop = 0;
    }
}

// Enhance Interview Q&A with Accordion/Toggle features
function enhanceInterviewDOM(container) {
    if (!container) return;

    // 1. Transform '관련 대표 채용 포지션' Blockquote into Accordion Box
    const blockquote = container.querySelector('blockquote');
    if (blockquote) {
        const text = blockquote.textContent || "";
        if (text.includes("대표") || text.includes("포지션")) {
            const accordionDiv = document.createElement('div');
            accordionDiv.className = 'interview-positions-accordion border border-slate-700/60 rounded-xl bg-slate-900/40 p-4 mb-6';

            const liCount = blockquote.querySelectorAll('li').length;
            const badgeLabel = liCount > 0 ? `${liCount}개 기업` : '상세보기';

            accordionDiv.innerHTML = `
                <div class="positions-toggle-btn flex justify-between items-center cursor-pointer select-none" role="button" tabindex="0" aria-expanded="false">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <i class="fa-solid fa-briefcase text-sky-400 text-sm shrink-0"></i>
                        <span class="font-semibold text-sm text-slate-200">관련 대표 채용 포지션 (실제 채용공고 기반)</span>
                        <span class="text-xs bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/30 font-medium">${badgeLabel}</span>
                    </div>
                    <div class="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <span class="positions-btn-label font-medium">펼치기 ▼</span>
                    </div>
                </div>
                <div class="positions-content-body hidden mt-3 pt-3 border-t border-slate-800 text-sm text-slate-300 leading-relaxed" style="display: none;">
                    ${blockquote.innerHTML}
                </div>
            `;

            const toggleHeader = accordionDiv.querySelector('.positions-toggle-btn');
            const contentBody = accordionDiv.querySelector('.positions-content-body');
            const btnLabel = accordionDiv.querySelector('.positions-btn-label');

            let isPositionsOpen = false;

            const togglePositions = () => {
                isPositionsOpen = !isPositionsOpen;
                if (isPositionsOpen) {
                    contentBody.classList.remove('hidden');
                    contentBody.style.display = 'block';
                    toggleHeader.classList.add('is-open');
                    btnLabel.innerHTML = '접기 ▲';
                    toggleHeader.setAttribute('aria-expanded', 'true');
                } else {
                    contentBody.classList.add('hidden');
                    contentBody.style.display = 'none';
                    toggleHeader.classList.remove('is-open');
                    btnLabel.innerHTML = '펼치기 ▼';
                    toggleHeader.setAttribute('aria-expanded', 'false');
                }
            };

            toggleHeader.addEventListener('click', (e) => {
                e.preventDefault();
                togglePositions();
            });

            toggleHeader.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePositions();
                }
            });

            // Clean up sibling hr tags if adjacent
            if (blockquote.previousElementSibling && blockquote.previousElementSibling.tagName === 'HR') {
                blockquote.previousElementSibling.remove();
            }
            if (blockquote.nextElementSibling && blockquote.nextElementSibling.tagName === 'HR') {
                blockquote.nextElementSibling.remove();
            }

            blockquote.parentNode.replaceChild(accordionDiv, blockquote);
        }
    }

    // 2. Transform Question Headers (h2) into Accordion Cards
    const h2Elements = Array.from(container.querySelectorAll('h2'));
    if (h2Elements.length === 0) return;

    // Build Global Control Bar
    const controlBar = document.createElement('div');
    controlBar.className = 'interview-controls-bar';
    controlBar.innerHTML = `
        <div class="flex items-center gap-2 text-sm text-slate-300 font-medium">
            <i class="fa-solid fa-circle-question text-emerald-400"></i>
            <span>기출 질문 <strong class="text-emerald-400 font-bold">${h2Elements.length}개</strong></span>
        </div>
        <button class="btn-toggle-all" type="button">
            <i class="fa-solid fa-layer-group text-sky-400"></i>
            <span class="toggle-all-label">전체 답변 펼치기</span>
        </button>
    `;

    const btnToggleAll = controlBar.querySelector('.btn-toggle-all');
    const toggleAllLabel = controlBar.querySelector('.toggle-all-label');

    const qnaCards = [];

    h2Elements.forEach((h2, index) => {
        const fullTitleText = h2.textContent.trim();
        
        let qNumStr = `Q${index + 1}`;
        let cleanTitle = fullTitleText;

        const qMatch = fullTitleText.match(/^(Q\d+[\.\:]?)\s*(.*)/i);
        if (qMatch) {
            qNumStr = qMatch[1].replace(/[\.\:]/g, '').trim();
            cleanTitle = qMatch[2].trim();
        }

        const card = document.createElement('div');
        card.className = 'interview-qna-card';

        const cardHeader = document.createElement('div');
        cardHeader.className = 'qna-card-header';
        cardHeader.setAttribute('role', 'button');
        cardHeader.setAttribute('tabindex', '0');
        cardHeader.setAttribute('aria-expanded', 'false');

        cardHeader.innerHTML = `
            <div class="qna-title-area flex items-start gap-3 min-w-0 flex-1">
                <span class="qna-num-badge">${qNumStr}</span>
                <h3 class="qna-title-text">${cleanTitle}</h3>
            </div>
            <div class="qna-toggle-action">
                <span class="qna-btn-text">답변 보기</span>
                <i class="fa-solid fa-chevron-down qna-icon"></i>
            </div>
        `;

        const answerBody = document.createElement('div');
        answerBody.className = 'qna-answer-body hidden';

        // Collect sibling nodes until next H2, HR, or positions accordion
        let sibling = h2.nextElementSibling;
        const nodesToMove = [];
        let trailingHr = null;

        while (sibling) {
            if (sibling.tagName === 'H2' || sibling.classList.contains('interview-positions-accordion')) {
                break;
            }
            if (sibling.tagName === 'HR') {
                trailingHr = sibling;
                break;
            }
            const current = sibling;
            sibling = sibling.nextElementSibling;
            nodesToMove.push(current);
        }

        nodesToMove.forEach(node => {
            answerBody.appendChild(node);
        });

        card.appendChild(cardHeader);
        card.appendChild(answerBody);
        qnaCards.push(card);

        const btnText = cardHeader.querySelector('.qna-btn-text');

        const toggleCard = () => {
            const isCurrentlyHidden = answerBody.classList.contains('hidden');
            if (isCurrentlyHidden) {
                answerBody.classList.remove('hidden');
                card.classList.add('is-open');
                cardHeader.setAttribute('aria-expanded', 'true');
                btnText.textContent = '답변 닫기';
            } else {
                answerBody.classList.add('hidden');
                card.classList.remove('is-open');
                cardHeader.setAttribute('aria-expanded', 'false');
                btnText.textContent = '답변 보기';
            }
            updateGlobalToggleState();
        };

        cardHeader.addEventListener('click', toggleCard);
        cardHeader.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleCard();
            }
        });

        if (trailingHr) {
            trailingHr.remove();
        }
        h2.parentNode.replaceChild(card, h2);
    });

    if (qnaCards.length > 0 && qnaCards[0].parentNode) {
        qnaCards[0].parentNode.insertBefore(controlBar, qnaCards[0]);
    }

    function updateGlobalToggleState() {
        const allOpen = qnaCards.every(c => !c.querySelector('.qna-answer-body').classList.contains('hidden'));
        if (allOpen) {
            toggleAllLabel.textContent = '전체 답변 접기';
            btnToggleAll.querySelector('i').className = 'fa-solid fa-compress text-sky-400';
        } else {
            toggleAllLabel.textContent = '전체 답변 펼치기';
            btnToggleAll.querySelector('i').className = 'fa-solid fa-layer-group text-sky-400';
        }
    }

    btnToggleAll.addEventListener('click', () => {
        const allOpen = qnaCards.every(c => !c.querySelector('.qna-answer-body').classList.contains('hidden'));
        const shouldExpand = !allOpen;

        qnaCards.forEach(card => {
            const body = card.querySelector('.qna-answer-body');
            const header = card.querySelector('.qna-card-header');
            const btnText = card.querySelector('.qna-btn-text');

            if (shouldExpand) {
                body.classList.remove('hidden');
                card.classList.add('is-open');
                header.setAttribute('aria-expanded', 'true');
                btnText.textContent = '답변 닫기';
            } else {
                body.classList.add('hidden');
                card.classList.remove('is-open');
                header.setAttribute('aria-expanded', 'false');
                btnText.textContent = '답변 보기';
            }
        });

        updateGlobalToggleState();
    });
}

// Standalone Promoted News View Logic
let currentNewsSearchQuery = "";
let selectedNewsId = "";
let currentNewsMobileMode = "list"; // 'list' or 'detail'

function setNewsMobileMode(mode) {
    const container = document.getElementById('news-layout-container');
    const sidebar = document.getElementById('news-sidebar-area');
    const content = document.getElementById('news-content-area');
    const btnBack = document.getElementById('btn-back-to-news-list');
    const isMobile = window.innerWidth <= 768;

    currentNewsMobileMode = mode;

    if (!isMobile) {
        if (container) {
            container.classList.remove('mobile-show-list', 'mobile-show-detail');
        }
        if (sidebar) sidebar.style.display = '';
        if (content) content.style.display = '';
        if (btnBack) btnBack.style.display = 'none';
        return;
    }

    if (mode === 'detail') {
        if (container) {
            container.classList.remove('mobile-show-list');
            container.classList.add('mobile-show-detail');
        }
        if (sidebar) sidebar.style.display = 'none';
        if (content) content.style.display = 'block';
        if (btnBack) btnBack.style.display = 'inline-flex';
        window.scrollTo(0, 0);
    } else { // 'list'
        if (container) {
            container.classList.remove('mobile-show-detail');
            container.classList.add('mobile-show-list');
        }
        if (sidebar) sidebar.style.display = 'flex';
        if (content) content.style.display = 'none';
        if (btnBack) btnBack.style.display = 'none';
        window.scrollTo(0, 0);
    }
}

function getSortedNewsItems() {
    if (typeof JOBS_DATA === 'undefined') return [];
    let newsItems = JOBS_DATA.filter(j => j.is_news);

    const parseDateValue = (item) => {
        if (item.news_date) {
            const m = item.news_date.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
            if (m) {
                return parseInt(`${m[1]}${m[2].padStart(2, '0')}${m[3].padStart(2, '0')}`, 10);
            }
            const mYM = item.news_date.match(/(\d{4})\D+(\d{1,2})/);
            if (mYM) {
                return parseInt(`${mYM[1]}${mYM[2].padStart(2, '0')}00`, 10);
            }
        }
        const mCode = (item.id || item.title).match(/2[3-9]\d{2}/);
        if (mCode) {
            return parseInt(`20${mCode[0]}00`, 10);
        }
        return 0;
    };

    newsItems.sort((a, b) => parseDateValue(b) - parseDateValue(a));
    return newsItems;
}

function initNewsView() {
    if (typeof JOBS_DATA === 'undefined') return;

    const newsSearchInput = document.getElementById('news-search-input');
    if (newsSearchInput && !newsSearchInput.dataset.bound) {
        newsSearchInput.dataset.bound = "true";
        newsSearchInput.addEventListener('input', (e) => {
            currentNewsSearchQuery = e.target.value.toLowerCase().trim();
            renderNewsList();
        });
    }

    const btnBack = document.getElementById('btn-back-to-news-list');
    if (btnBack && !btnBack.dataset.bound) {
        btnBack.dataset.bound = "true";
        btnBack.addEventListener('click', () => {
            selectedNewsId = "";
            if (window.location.hash.includes('news/')) {
                history.replaceState(null, '', '#news');
            }
            const newsCatList = document.getElementById('news-cat-list');
            if (newsCatList) {
                newsCatList.querySelectorAll('.interview-cat-btn').forEach(btn => btn.classList.remove('active'));
            }
            setNewsMobileMode('list');
        });
    }

    if (!window.datasetNewsResizeBound) {
        window.datasetNewsResizeBound = true;
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                setNewsMobileMode('desktop');
            } else {
                setNewsMobileMode(currentNewsMobileMode);
            }
        });
    }

    renderNewsList();

    const newsItems = getSortedNewsItems();
    if (newsItems.length > 0 && !selectedNewsId) {
        renderNewsItem(newsItems[0].id, false, false);
    }

    if (window.innerWidth <= 768) {
        if (window.location.hash.includes('/') && window.location.hash.startsWith('#news/')) {
            setNewsMobileMode('detail');
        } else {
            setNewsMobileMode('list');
        }
    } else {
        setNewsMobileMode('desktop');
    }
}

function renderNewsList() {
    const newsCatList = document.getElementById('news-cat-list');
    const newsTotalCount = document.getElementById('news-total-count');
    if (!newsCatList || typeof JOBS_DATA === 'undefined') return;

    let newsItems = getSortedNewsItems();

    if (currentNewsSearchQuery) {
        newsItems = newsItems.filter(news => {
            const searchHaystack = `${news.title} ${news.raw_content}`.toLowerCase();
            return searchHaystack.includes(currentNewsSearchQuery);
        });
    }

    if (newsTotalCount) {
        newsTotalCount.textContent = newsItems.length;
    }

    newsCatList.innerHTML = '';
    if (newsItems.length === 0) {
        newsCatList.innerHTML = '<p style="font-size: 0.82rem; color: var(--text-muted); padding: 10px;">검색 결과가 없습니다.</p>';
        return;
    }

    newsItems.forEach(news => {
        const btn = document.createElement('button');
        btn.className = `interview-cat-btn news-row-item ${selectedNewsId === news.id ? 'active' : ''}`;
        btn.dataset.newsId = news.id;

        let shortTitle = news.title
            .replace(/^#\s*/, '')
            .replace(/^\[.*?\]\s*/, '')
            .replace(/^뉴스\s*/, '')
            .trim();
        let dateTag = '';
        if (news.news_date) {
            dateTag = news.news_date
                .replace(/^20/, '')
                .replace(/년\s*/g, '.')
                .replace(/월\s*/g, '.')
                .replace(/일/g, '')
                .replace(/-/g, '.')
                .trim();
        } else {
            const dateMatch = news.id.match(/^(\d{2})(\d{2})(\d{2})/);
            if (dateMatch) {
                dateTag = `${dateMatch[1]}.${dateMatch[2]}.${dateMatch[3]}`;
            }
        }

        btn.title = shortTitle;
        btn.innerHTML = `
            <span class="news-item-title" title="${shortTitle}">${shortTitle}</span>
            <span class="news-date-badge news-item-date">${dateTag}</span>
        `;

        btn.onclick = () => {
            renderNewsItem(news.id, true, true);
        };

        newsCatList.appendChild(btn);
    });
}

function renderNewsItem(newsId, updateHash = true, userClick = false) {
    if (typeof JOBS_DATA === 'undefined') return;

    selectedNewsId = newsId;
    const newsJob = JOBS_DATA.find(j => j.id === newsId);
    if (!newsJob) return;

    if (updateHash && window.location.hash.includes('news')) {
        history.replaceState(null, '', `#news/${encodeURIComponent(newsId)}`);
    }

    const newsCatList = document.getElementById('news-cat-list');
    if (newsCatList) {
        newsCatList.querySelectorAll('.interview-cat-btn').forEach(btn => {
            if (btn.dataset.newsId === newsId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    const selectedNewsTitle = document.getElementById('selected-news-title');
    const newsMarkdown = document.getElementById('news-markdown');

    if (selectedNewsTitle) {
        selectedNewsTitle.innerHTML = `<i class="fa-solid fa-newspaper"></i> ${newsJob.title}`;
    }
    if (newsMarkdown) {
        newsMarkdown.innerHTML = marked.parse(newsJob.raw_content);
    }

    if (window.innerWidth <= 768 && (userClick || (window.location.hash.includes('/') && window.location.hash.startsWith('#news/')))) {
        setNewsMobileMode('detail');
    }
}

function renderLectureView() {
    const lectureMarkdown = document.getElementById('lecture-markdown');
    if (!lectureMarkdown || typeof JOBS_DATA === 'undefined') return;

    const lectureJob = JOBS_DATA.find(j => j.is_lecture);
    if (!lectureJob || !lectureJob.raw_content) {
        lectureMarkdown.innerHTML = `
            <h1>로봇 실무 프로젝트 / 커리큘럼 안내</h1>
            <p>로봇 및 AI 실무 프로젝트 관련 커리큘럼이 준비되는 대로 업데이트될 예정입니다.</p>
        `;
        return;
    }

    try {
        const sections = parseLectureMarkdown(lectureJob.raw_content);
        if (!sections || sections.length === 0) {
            lectureMarkdown.innerHTML = marked.parse(lectureJob.raw_content);
            return;
        }

        let html = '';
        sections.forEach(section => {
            let sectionIcon = 'fa-graduation-cap';
            if (section.title.includes('인프런')) sectionIcon = 'fa-laptop-code';
            if (section.title.includes('코멘토')) sectionIcon = 'fa-users-gear';

            html += `<h3 class="lecture-section-title"><i class="fa-solid ${sectionIcon}"></i> ${section.title}</h3>`;
            html += `<div class="lecture-grid">`;

            section.courses.forEach(course => {
                const comingSoonClass = course.isComingSoon ? 'coming-soon' : '';
                const encodedThumbUrl = encodeURI(course.thumbnailUrl);
                const placeholderIcon = course.placeholderIcon || 'fa-robot';

                html += `
                    <div class="lecture-course-card ${comingSoonClass}">
                        <div class="lecture-thumb-box">
                            <img class="lecture-thumb-img" 
                                 src="${encodedThumbUrl}" 
                                 alt="${course.title}" 
                                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                            <div class="lecture-thumb-placeholder" style="display: none;">
                                <i class="fa-solid ${placeholderIcon} placeholder-icon"></i>
                                <span class="placeholder-text">ROBOTICS COURSE</span>
                            </div>
                            <span class="lecture-badge-overlay">${course.badge}</span>
                        </div>
                        <div class="lecture-card-body">
                            <div>
                                <h4 class="lecture-card-title" title="${course.title}">${course.title}</h4>
                                <p class="lecture-card-desc">${course.description || '현직 개발자의 노하우가 담긴 실무 중심 커리큘럼입니다.'}</p>
                            </div>
                            <div class="lecture-card-footer">
                                ${course.isComingSoon 
                                    ? `<button class="btn-lecture-apply disabled" disabled><i class="fa-solid fa-clock"></i> 개설 예정 (Coming Soon)</button>`
                                    : `<a href="${course.link}" target="_blank" rel="noopener noreferrer" class="btn-lecture-apply"><i class="fa-solid fa-arrow-up-right-from-square"></i> 수강 신청 바로가기</a>`
                                }
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        });

        lectureMarkdown.innerHTML = html;
    } catch (e) {
        console.error('Failed to parse lecture cards:', e);
        lectureMarkdown.innerHTML = marked.parse(lectureJob.raw_content);
    }
}

function getCourseThumbnailAndIcon(title, badge) {
    const titleLower = title.toLowerCase();
    const badgeLower = badge.toLowerCase();

    if (titleLower.includes('so-arm101') || titleLower.includes('로봇 제어') || badgeLower.includes('제어sw')) {
        return {
            thumbnailUrl: 'IMG/thumb-control-soarm101.png',
            fileName: 'thumb-control-soarm101.png',
            placeholderIcon: 'fa-robot'
        };
    }
    if (titleLower.includes('mcu') || titleLower.includes('임베디드') || badgeLower.includes('임베디드')) {
        return {
            thumbnailUrl: 'IMG/thumb-embedded-mcu.png',
            fileName: 'thumb-embedded-mcu.png',
            placeholderIcon: 'fa-microchip'
        };
    }
    if (titleLower.includes('자율주행') || badgeLower.includes('자율주행')) {
        return {
            thumbnailUrl: 'IMG/thumb-autonomous-sw.png',
            fileName: 'thumb-autonomous-sw.png',
            placeholderIcon: 'fa-car-side'
        };
    }
    if (titleLower.includes('양산') || titleLower.includes('개발 프로세스')) {
        return {
            thumbnailUrl: 'IMG/thumb-robot-mass-production.png',
            fileName: 'thumb-robot-mass-production.png',
            placeholderIcon: 'fa-industry'
        };
    }
    if (titleLower.includes('시스템 완전 해부') || titleLower.includes('부품부터 통신') || titleLower.includes('로보틱스 시스템')) {
        return {
            thumbnailUrl: 'IMG/thumb-robotics-hardware-comm.png',
            fileName: 'thumb-robotics-hardware-comm.png',
            placeholderIcon: 'fa-diagram-project'
        };
    }
    if (badgeLower.includes('부트캠프') || titleLower.includes('코멘토') || titleLower.includes('성과 만들기')) {
        return {
            thumbnailUrl: 'IMG/thumb-comento-mentoring.png',
            fileName: 'thumb-comento-mentoring.png',
            placeholderIcon: 'fa-users-gear'
        };
    }
    return {
        thumbnailUrl: 'IMG/thumb-default-course.png',
        fileName: 'thumb-default-course.png',
        placeholderIcon: 'fa-laptop-code'
    };
}

function parseLectureMarkdown(markdown) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;
    let currentCourse = null;

    for (let rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        if (line.startsWith('## ')) {
            if (currentCourse && currentSection) {
                currentSection.courses.push(currentCourse);
                currentCourse = null;
            }
            if (currentSection && currentSection.courses.length > 0) {
                sections.push(currentSection);
            }
            currentSection = {
                title: line.replace('## ', '').trim(),
                courses: []
            };
        } else if (line.startsWith('### ')) {
            if (currentCourse && currentSection) {
                currentSection.courses.push(currentCourse);
            }
            const rawTitle = line.replace('### ', '').trim();
            let badge = '추천 강의';
            let title = rawTitle;

            const badgeMatch = rawTitle.match(/^\[(.*?)\]\s*(.*)/);
            if (badgeMatch) {
                badge = badgeMatch[1];
                title = badgeMatch[2] || badgeMatch[1];
            } else if (currentSection && currentSection.title.includes('코멘토')) {
                badge = '직무부트캠프';
            }

            const thumbInfo = getCourseThumbnailAndIcon(title, badge);

            currentCourse = {
                badge: badge,
                title: title,
                link: '',
                isComingSoon: false,
                description: '',
                thumbnailUrl: thumbInfo.thumbnailUrl,
                placeholderIcon: thumbInfo.placeholderIcon
            };
        } else if (line.startsWith('* **') && currentCourse) {
            if (line.includes('수강 신청')) {
                const linkMatch = line.match(/\[.*?\]\((.*?)\)/);
                if (linkMatch) {
                    currentCourse.link = linkMatch[1];
                }
            } else if (line.includes('상태')) {
                if (line.includes('개설 예정') || line.includes('Coming Soon')) {
                    currentCourse.isComingSoon = true;
                }
            } else if (line.includes('주요 내용')) {
                currentCourse.description = line.replace(/^\* \*\*주요 내용\*\*:\s*/, '').trim();
            }
        }
    }

    if (currentCourse && currentSection) {
        currentSection.courses.push(currentCourse);
    }
    if (currentSection && currentSection.courses.length > 0) {
        sections.push(currentSection);
    }

    return sections;
}


// Security & Content Protection: Prevent Right-Click, Selection, Developer Tools & Add Watermark
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});

document.addEventListener('keydown', (e) => {
    // Block F12, Ctrl+U, Ctrl+S, Ctrl+C, Ctrl+Shift+I/J/C
    if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S' || e.key === 'c' || e.key === 'C')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
    ) {
        e.preventDefault();
        return false;
    }
});

// Auto Watermark on Copy
document.addEventListener('copy', (e) => {
    e.preventDefault();
    const selection = window.getSelection();
    const watermark = "\n\n[출처: ROBO-JD 대시보드 (https://jellycoding0.github.io/jd-hub/) - 무단 전재, 크롤링 및 불법 재배포를 금지합니다.]";
    if (e.clipboardData) {
        e.clipboardData.setData('text/plain', selection.toString() + watermark);
    }
});

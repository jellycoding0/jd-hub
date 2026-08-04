// Main State
let activeTags = new Set();
let activeCompanies = new Set();
let activeYears = new Set();
let searchQuery = "";
let sortBy = "company";

// Tag display translation mapping (Korean & Custom terms)
const TAG_DISPLAY_NAMES = {
    "ai": "AI",
    "control": "제어",
    "embedded": "임베디드SW",
    "hw_전장": "HW전장",
    "hw_기구": "HW기구",
    "autonomous-driving": "자율주행",
    "product": "양산/기획"
};

// DOM Elements
const jobsGrid = document.getElementById('jobs-grid');
const tagCloud = document.getElementById('tag-cloud');
const companyFilterList = document.getElementById('company-filter-list');
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
    // Enable single line breaks in markdown rendering (\n -> <br>)
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    initFilters();
    renderJobs();
    updateGlobalStats();
    
    // Bind Event Listeners
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        renderJobs();
    });
    
    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderJobs();
    });
    
    btnClearCompanies.addEventListener('click', () => {
        activeCompanies.clear();
        document.querySelectorAll('.company-checkbox').forEach(cb => cb.checked = false);
        renderJobs();
    });

    btnClosePanel.addEventListener('click', closeDetailPanel);
    panelOverlay.addEventListener('click', closeDetailPanel);

    // Bind Guide Button
    const btnShowGuide = document.getElementById('btn-show-guide');
    if (btnShowGuide) {
        btnShowGuide.addEventListener('click', () => {
            const guideJob = JOBS_DATA.find(j => j.is_guide);
            if (guideJob) {
                openDetailPanel(guideJob);
            }
        });
    }

    // Bind Lecture Button
    const btnShowLecture = document.getElementById('btn-show-lecture');
    if (btnShowLecture) {
        btnShowLecture.addEventListener('click', () => {
            const lectureJob = JOBS_DATA.find(j => j.is_lecture);
            if (lectureJob) {
                openDetailPanel(lectureJob);
            }
        });
    }
});

// Calculate and initialize filter options
function initFilters() {
    const companies = {};
    const tags = {};
    const years = {};
    
    JOBS_DATA.forEach(job => {
        // Count JDs per company
        companies[job.company] = (companies[job.company] || 0) + 1;
        
        // Count JDs per tag
        job.tags.forEach(tag => {
            const cleanTag = tag.toLowerCase().trim();
            if (cleanTag) {
                tags[cleanTag] = (tags[cleanTag] || 0) + 1;
            }
        });

        // Count JDs per year
        if (job.year) {
            years[job.year] = (years[job.year] || 0) + 1;
        }
    });

    // Render Company Checkboxes
    companyFilterList.innerHTML = '';
    Object.keys(companies).sort().forEach(companyName => {
        // Skip "학습 가이드" from the company filter list
        if (companyName === "학습 가이드") return;

        const item = document.createElement('label');
        item.className = 'company-item';
        item.innerHTML = `
            <input type="checkbox" class="company-checkbox" value="${companyName}">
            <span>${companyName}</span>
            <span class="company-count">${companies[companyName]}</span>
        `;
        
        item.querySelector('input').addEventListener('change', (e) => {
            if (e.target.checked) {
                activeCompanies.add(companyName);
            } else {
                activeCompanies.delete(companyName);
            }
            renderJobs();
        });
        
        companyFilterList.appendChild(item);
    });

    // Render Tag Badges
    tagCloud.innerHTML = '';
    const allowedJobTags = new Set(Object.keys(TAG_DISPLAY_NAMES));
    
    // Sort tags by frequency
    const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a]);
    sortedTags.forEach(tagName => {
        const cleanTagName = tagName.toLowerCase().trim();
        if (!allowedJobTags.has(cleanTagName)) return;

        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        const displayName = TAG_DISPLAY_NAMES[cleanTagName] || tagName;
        badge.textContent = `${displayName} (${tags[tagName]})`;
        
        badge.addEventListener('click', () => {
            if (activeTags.has(tagName)) {
                activeTags.delete(tagName);
                badge.classList.remove('active');
            } else {
                activeTags.add(tagName);
                badge.classList.add('active');
            }
            renderJobs();
        });
        
        tagCloud.appendChild(badge);
    });

    // Render Year Badges
    yearFilterList.innerHTML = '';
    Object.keys(years).sort().forEach(yearName => {
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        let displayText = `20${yearName}년`;
        if (yearName === '26') {
            displayText = "2026년 이후";
        }
        badge.textContent = `${displayText} (${years[yearName]})`;
        
        badge.addEventListener('click', () => {
            if (activeYears.has(yearName)) {
                activeYears.delete(yearName);
                badge.classList.remove('active');
            } else {
                activeYears.add(yearName);
                badge.classList.add('active');
            }
            renderJobs();
        });
        
        yearFilterList.appendChild(badge);
    });
}



// Filter and Render Jobs Cards
function renderJobs() {
    let filtered = JOBS_DATA.filter(job => {
        // Company Filter
        if (activeCompanies.size > 0 && !activeCompanies.has(job.company)) {
            return false;
        }
        
        // Tag Filter
        if (activeTags.size > 0) {
            const hasMatchingTag = job.tags.some(tag => activeTags.has(tag.toLowerCase().trim()));
            if (!hasMatchingTag) return false;
        }

        // Year Filter
        if (activeYears.size > 0 && !activeYears.has(job.year)) {
            return false;
        }
        
        // Search query filter (matches company, title, tag, or content)
        if (searchQuery) {
            const inCompany = job.company.toLowerCase().includes(searchQuery);
            const inTitle = job.title.toLowerCase().includes(searchQuery);
            const inTags = job.tags.some(tag => tag.toLowerCase().includes(searchQuery));
            const inContent = job.raw_content.toLowerCase().includes(searchQuery);
            
            if (!inCompany && !inTitle && !inTags && !inContent) {
                return false;
            }
        }
        
        return true;
    });

    // Sort Results
    filtered.sort((a, b) => {
        if (sortBy === "company") {
            return a.company.localeCompare(b.company, 'ko');
        } else {
            return a.title.localeCompare(b.title, 'ko');
        }
    });

    // Update Result Counts
    resultsCount.textContent = `검색 결과: ${filtered.length}개 포지션`;

    // Render Cards
    jobsGrid.innerHTML = '';
    if (filtered.length === 0) {
        jobsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 1rem; color: rgba(255,255,255,0.05);"></i>
                <p>일치하는 포지션이 없습니다. 필터를 해제해 보세요.</p>
            </div>
        `;
        return;
    }

    filtered.forEach(job => {
        const card = document.createElement('div');
        const isGuide = job.is_guide;
        const isLecture = job.is_lecture;
        card.className = `job-card ${job.is_intro ? 'intro-card' : ''} ${isGuide ? 'guide-card' : ''} ${isLecture ? 'lecture-card' : ''}`;
        
        const tagsHtml = job.tags.map(t => {
            const cleanT = t.toLowerCase().trim();
            const displayName = TAG_DISPLAY_NAMES[cleanT] || t;
            return `<span class="card-tag">${displayName}</span>`;
        }).join('');
        const yearBadgeHtml = (job.year && !job.is_intro && !isGuide && !isLecture) ? `<span class="card-tag year-tag" style="background: rgba(168, 85, 247, 0.08); color: var(--secondary); border: 1px solid rgba(168, 85, 247, 0.15); font-weight: 500;">'${job.year}년</span>` : '';
        const badgeIntroHtml = job.is_intro ? `<span class="card-badge-intro">기업소개</span>` : '';
        const badgeGuideHtml = isGuide ? `<span class="card-badge-guide">학습가이드</span>` : '';
        const badgeLectureHtml = isLecture ? `<span class="card-badge-lecture">추천강의</span>` : '';

        card.innerHTML = `
            <div class="card-top">
                <span class="card-company">${job.company}</span>
                <h3 class="card-title">${job.title}</h3>
            </div>
            <div class="card-bottom">
                <div class="card-tags">
                    ${tagsHtml}
                    ${yearBadgeHtml}
                </div>
                <div class="card-meta">
                    ${badgeIntroHtml}
                    ${badgeGuideHtml}
                    ${badgeLectureHtml}
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openDetailPanel(job));
        jobsGrid.appendChild(card);
    });
}

// Open Detail Panel and load Markdown
function openDetailPanel(job) {
    detailCompany.textContent = job.company;
    detailTitle.textContent = job.title;
    
    // Render Tags
    detailTags.innerHTML = '';
    job.tags.forEach(tag => {
        const badge = document.createElement('span');
        badge.className = 'card-tag';
        const cleanTag = tag.toLowerCase().trim();
        badge.textContent = TAG_DISPLAY_NAMES[cleanTag] || tag;
        detailTags.appendChild(badge);
    });
    
    // Parse Markdown
    detailMarkdown.innerHTML = marked.parse(job.raw_content);
    

    
    // Show Panel
    detailPanel.classList.add('active');
}

// Close Detail Panel
function closeDetailPanel() {
    detailPanel.classList.remove('active');
    renderJobs(); // Refresh card completion badge
}

// Update Global Dashboard Statistics
function updateGlobalStats() {
    if (!statCompanies || !statJds) return;
    // Unique companies count
    const uniqueCompanies = new Set(JOBS_DATA.map(j => j.company));
    statCompanies.textContent = uniqueCompanies.size;
    
    // Total JD count
    statJds.textContent = JOBS_DATA.length;
}

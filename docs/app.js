// Main State
let activeTags = new Set();
let activeCompanies = new Set();
let searchQuery = "";
let sortBy = "company";

// DOM Elements
const jobsGrid = document.getElementById('jobs-grid');
const tagCloud = document.getElementById('tag-cloud');
const companyFilterList = document.getElementById('company-filter-list');
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
});

// Calculate and initialize filter options
function initFilters() {
    const companies = {};
    const tags = {};
    
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
    });

    // Render Company Checkboxes
    companyFilterList.innerHTML = '';
    Object.keys(companies).sort().forEach(companyName => {
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
    // Sort tags by frequency
    const sortedTags = Object.keys(tags).sort((a, b) => tags[b] - tags[a]);
    sortedTags.forEach(tagName => {
        const badge = document.createElement('span');
        badge.className = 'tag-badge';
        badge.textContent = `${tagName} (${tags[tagName]})`;
        
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
        card.className = `job-card ${job.is_intro ? 'intro-card' : ''}`;
        
        const tagsHtml = job.tags.map(t => `<span class="card-tag">${t}</span>`).join('');
        const badgeIntroHtml = job.is_intro ? `<span class="card-badge-intro">기업소개</span>` : '';

        card.innerHTML = `
            <div class="card-top">
                <span class="card-company">${job.company}</span>
                <h3 class="card-title">${job.title}</h3>
            </div>
            <div class="card-bottom">
                <div class="card-tags">
                    ${tagsHtml}
                </div>
                <div class="card-meta">
                    ${badgeIntroHtml}
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
        badge.textContent = tag;
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
    // Unique companies count
    const uniqueCompanies = new Set(JOBS_DATA.map(j => j.company));
    statCompanies.textContent = uniqueCompanies.size;
    
    // Total JD count
    statJds.textContent = JOBS_DATA.length;
}

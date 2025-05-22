// Helper: Map quartile to color
const quartileColors = {
    'Q1': 'green',
    'Q2': 'blue',
    'Q3': 'orange',
    'Q4': 'red'
};

// Extract journal names from Google Scholar search results
function extractJournals() {
    // For Google Scholar: journal info is in .gs_a
    const journalElements = document.querySelectorAll('.gs_a');
    let journals = [];
    journalElements.forEach(el => {
        // Example: "J Smith - Nature, 2022 - nature.com"
        // Try to extract the journal name (after the dash, before the comma)
        const parts = el.innerText.split(' - ');
        if (parts.length > 1) {
            const afterDash = parts[1];
            const journal = afterDash.split(',')[0].trim();
            journals.push({element: el, name: journal});
        }
    });
    return journals;
}

// Helper: Cache quartile lookups in localStorage
function getCachedQuartile(journal) {
    const cache = JSON.parse(localStorage.getItem('quartileCache') || '{}');
    return cache[journal];
}
function setCachedQuartile(journal, data) {
    const cache = JSON.parse(localStorage.getItem('quartileCache') || '{}');
    cache[journal] = data;
    localStorage.setItem('quartileCache', JSON.stringify(cache));
}

// Listen for messages from popup.js for filtering, sorting, and exporting
let currentFilter = 'all';
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'SET_FILTER') {
        currentFilter = msg.value;
        applyQuartileFilter();
    } else if (msg.type === 'SORT_BY_QUARTILE') {
        sortArticlesByQuartile();
    } else if (msg.type === 'EXPORT_CSV') {
        exportVisibleArticlesToCSV();
    }
});

// Apply quartile filter to articles
function applyQuartileFilter() {
    const journals = extractJournals();
    journals.forEach(({element}) => {
        const badge = element.querySelector('.quartile-badge');
        const q = badge ? badge.textContent : '';
        let show = true;
        if (currentFilter === 'q1') show = (q === 'Q1');
        if (currentFilter === 'q1q2') show = (q === 'Q1' || q === 'Q2');
        element.closest('.gs_r, .gs_ri, .gs_scl')?.style.setProperty('opacity', show ? '1' : '0.3');
        element.closest('.gs_r, .gs_ri, .gs_scl')?.style.setProperty('display', show ? '' : '');
    });
}

// Sort articles by quartile (Q1 first, then Q2, ...)
function sortArticlesByQuartile() {
    const container = document.querySelector('#gs_res_ccl_mid');
    if (!container) return;
    const articles = Array.from(container.children);
    articles.sort((a, b) => {
        const qa = (a.querySelector('.quartile-badge')?.textContent || 'Q5').replace('N/A','Q5');
        const qb = (b.querySelector('.quartile-badge')?.textContent || 'Q5').replace('N/A','Q5');
        return qa.localeCompare(qb);
    });
    articles.forEach(article => container.appendChild(article));
}

// Export visible Q1/Q2 articles to CSV
function exportVisibleArticlesToCSV() {
    const journals = extractJournals();
    let rows = [['Title','Authors','Journal','Quartile']];
    journals.forEach(({element}) => {
        const badge = element.querySelector('.quartile-badge');
        const q = badge ? badge.textContent : '';
        if (q === 'Q1' || q === 'Q2') {
            const title = element.closest('.gs_r, .gs_ri, .gs_scl')?.querySelector('.gs_rt')?.innerText || '';
            const authors = element.innerText.split(' - ')[0] || '';
            const journal = element.innerText.split(' - ')[1]?.split(',')[0] || '';
            rows.push([title, authors, journal, q]);
        }
    });
    const csv = rows.map(r => r.map(x => '"'+x.replace(/"/g,'""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'q1_q2_results.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add badge next to journal name, with colored metrics and best visualization
function addBadge(el, quartile, match, score, sjr_url, sjr, impact_factor, open_access) {
    if (el.querySelector('.quartile-badge')) return;
    // Quartile badge
    const badge = document.createElement('span');
    badge.className = 'quartile-badge';
    badge.textContent = quartile || 'N/A';
    badge.style.marginLeft = '8px';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '8px';
    badge.style.background = quartileColors[quartile] || '#bdbdbd';
    badge.style.color = 'white';
    badge.style.fontWeight = 'bold';
    badge.title = `SJR Quartile: ${quartile || 'N/A'}\nSJR: ${sjr || 'N/A'}\nImpact Factor: ${impact_factor || 'N/A'}\nOpen Access: ${open_access || 'N/A'}\nMatch: ${match || 'N/A'}\nScore: ${score || 0}`;
    if (sjr_url) {
        badge.style.cursor = 'pointer';
        badge.addEventListener('click', e => {
            e.stopPropagation();
            window.open(sjr_url, '_blank');
        });
    }
    el.appendChild(badge);

    // Metrics visualization with clear colors
    const metrics = document.createElement('span');
    metrics.className = 'quartile-metrics';
    metrics.style.marginLeft = '8px';
    metrics.style.fontSize = '90%';
    metrics.style.display = 'inline-flex';
    metrics.style.alignItems = 'center';

    // SJR (teal)
    if (sjr && sjr !== 'N/A') {
        const sjrSpan = document.createElement('span');
        sjrSpan.textContent = `SJR: ${sjr}`;
        sjrSpan.style.background = '#00bcd4'; // teal
        sjrSpan.style.color = 'white';
        sjrSpan.style.padding = '1px 7px';
        sjrSpan.style.borderRadius = '6px';
        sjrSpan.style.marginRight = '6px';
        sjrSpan.style.fontWeight = 'bold';
        metrics.appendChild(sjrSpan);
    }
    // Impact Factor (deep orange)
    if (impact_factor && impact_factor !== 'N/A') {
        const ifSpan = document.createElement('span');
        ifSpan.textContent = `IF: ${impact_factor}`;
        ifSpan.style.background = '#ff9800'; // deep orange
        ifSpan.style.color = 'white';
        ifSpan.style.padding = '1px 7px';
        ifSpan.style.borderRadius = '6px';
        ifSpan.style.marginRight = '6px';
        ifSpan.style.fontWeight = 'bold';
        metrics.appendChild(ifSpan);
    }
    // Open Access (green for Yes, red for No)
    if (open_access && open_access !== 'N/A') {
        const oaSpan = document.createElement('span');
        oaSpan.textContent = 'OA';
        oaSpan.style.background = open_access === 'Yes' ? '#4caf50' : '#f44336';
        oaSpan.style.color = 'white';
        oaSpan.style.padding = '1px 7px';
        oaSpan.style.borderRadius = '6px';
        oaSpan.style.marginRight = '6px';
        oaSpan.style.fontWeight = 'bold';
        oaSpan.title = open_access === 'Yes' ? 'Open Access' : 'Not Open Access';
        metrics.appendChild(oaSpan);
    }
    if (metrics.childNodes.length > 0) {
        el.appendChild(metrics);
    }
}

// Main: For each journal, fetch quartile and display badge (with caching)
async function annotateJournals() {
    const journals = extractJournals();
    for (const {element, name} of journals) {
        // Skip if badge already exists
        if (element.querySelector('.quartile-badge')) continue;
        const cached = getCachedQuartile(name);
        if (cached) {
            addBadge(element, cached.quartile, cached.match, cached.score, cached.sjr_url, cached.sjr, cached.impact_factor, cached.open_access);
            continue;
        }
        try {
            const resp = await fetch(`http://127.0.0.1:5000/quartile?journal=${encodeURIComponent(name)}`);
            const data = await resp.json();
            setCachedQuartile(name, data);
            addBadge(element, data.quartile, data.match, data.score, data.sjr_url, data.sjr, data.impact_factor, data.open_access);
        } catch (e) {
            addBadge(element, null, null, 0, null, null, null, null);
        }
    }
    applyQuartileFilter(); // re-apply filter after annotation
}

// Run on page load
window.addEventListener('load', annotateJournals);

// Optionally, rerun if page changes (for dynamic content)
let lastUrl = location.href;
setInterval(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(annotateJournals, 1000);
    }
}, 2000);

// MutationObserver for dynamic content
const observer = new MutationObserver(() => {
    annotateJournals();
});
observer.observe(document.body, { childList: true, subtree: true });

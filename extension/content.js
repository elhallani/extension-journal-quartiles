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

// Add badge next to journal name, with tooltip for match info
function addBadge(el, quartile, match, score) {
    // Avoid duplicate badges
    if (el.querySelector('.quartile-badge')) return;
    const badge = document.createElement('span');
    badge.className = 'quartile-badge';
    badge.textContent = quartile || 'N/A';
    badge.style.marginLeft = '8px';
    badge.style.padding = '2px 6px';
    badge.style.borderRadius = '8px';
    badge.style.background = quartileColors[quartile] || 'gray';
    badge.style.color = 'white';
    badge.style.fontWeight = 'bold';
    badge.title = `SJR Quartile\nMatch: ${match || 'N/A'}\nScore: ${score || 0}`;
    el.appendChild(badge);
}

// Main: For each journal, fetch quartile and display badge (with caching)
async function annotateJournals() {
    const journals = extractJournals();
    for (const {element, name} of journals) {
        // Skip if badge already exists
        if (element.querySelector('.quartile-badge')) continue;
        const cached = getCachedQuartile(name);
        if (cached) {
            addBadge(element, cached.quartile, cached.match, cached.score);
            continue;
        }
        try {
            const resp = await fetch(`http://127.0.0.1:5000/quartile?journal=${encodeURIComponent(name)}`);
            const data = await resp.json();
            setCachedQuartile(name, data);
            addBadge(element, data.quartile, data.match, data.score);
        } catch (e) {
            addBadge(element, null, null, 0);
        }
    }
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

# extension-journal-quartiles

A Chrome extension and Python backend to automatically display the SJR quartile (Q1–Q4) for journals on Google Scholar and Semantic Scholar.

## Features
- Shows colored quartile badges (Q1–Q4) next to journal names.
- Uses SJR data (journals.csv) and a local Flask API with fuzzy matching.
- Supports dynamic content and caches lookups for speed.

## Project Structure
```
backend/
  quartile_api.py      # Flask API for quartile lookup
  journals.csv         # SJR data (download from scimagojr.com)
  requirements.txt     # Python dependencies
extension/
  manifest.json        # Chrome extension manifest
  content.js           # Content script for badge injection
  popup.html           # Extension popup UI for filtering, sorting, export
  popup.js             # Popup logic
```

## Supported Sites
- Google Scholar
- Semantic Scholar
- (Add more: PubMed, Web of Science, Scopus, etc. — see below)

## Adding Support for More Sites
- To support more academic sites, update `content.js`:
  - Add new selectors and extraction logic for each site (e.g., PubMed, Scopus).
  - Use `window.location.hostname` to detect the site and apply the right logic.
- Example:
  ```js
  function extractJournals() {
    if (location.hostname.includes('scholar.google.com')) {
      // ...Google Scholar logic...
    } else if (location.hostname.includes('semanticscholar.org')) {
      // ...Semantic Scholar logic...
    } else if (location.hostname.includes('pubmed.ncbi.nlm.nih.gov')) {
      // ...PubMed logic...
    }
    // Add more as needed
  }
  ```

## More Journal Metrics
- The backend (`quartile_api.py`) now returns:
  - Quartile (Q1–Q4)
  - SJR score
  - Impact Factor (if available)
  - Open Access status (if available)
  - Scimago Journal URL
- You can add more metrics by updating the backend to parse additional columns from `journals.csv` and return them in the API response.
- The extension displays these metrics in the badge tooltip.

## Customization
- **Badge Colors:**
  - Edit `content.js` to change badge colors for each quartile.
- **API Endpoint:**
  - Make the API URL configurable via an options page or popup.
- **Quartile Filter/Sort:**
  - Use the popup to filter/sort results by quartile.
- **Export:**
  - Export Q1/Q2 results to CSV from the popup.
- **Add More Features:**
  - Add notifications, highlight open access, or integrate with reference managers.

## How to Extend
1. **To support a new site:**
   - Add a new `else if` block in `extractJournals()` in `content.js` for the site's structure.
2. **To add a new metric:**
   - Update `quartile_api.py` to extract and return the metric from the CSV.
   - Update badge tooltip logic in `content.js` to display it.
3. **To customize UI:**
   - Edit `popup.html` and `popup.js` for new controls or settings.

---

MIT License

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
```

## Setup Instructions

### 1. Download SJR Data
- Go to https://www.scimagojr.com/journalrank.php
- Click "Download data" and save as `journals.csv` in `backend/`

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python quartile_api.py
```
- The API runs at http://127.0.0.1:5000

### 3. Load the Chrome Extension
- Go to `chrome://extensions/`
- Enable Developer mode
- Click "Load unpacked" and select the `extension/` folder

### 4. Test the Workflow
- Open Google Scholar and search for articles
- Quartile badges should appear next to journal names

## Troubleshooting
- **CORS errors:** Ensure Flask is running with CORS enabled
- **No badges:** Check API is running and accessible
- **Selector changes:** Update selectors in `content.js` if site layout changes

## Improvements
- MutationObserver for dynamic content
- Caching with localStorage
- Tooltip with match info
- Easy to extend for more sites or features

---

MIT License

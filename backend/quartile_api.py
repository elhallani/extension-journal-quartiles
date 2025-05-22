from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from fuzzywuzzy import process

# Load SJR data
try:
    df = pd.read_csv('journals.csv', sep=';', quotechar='"')
    journal_titles = df['Title'].tolist()
except Exception as e:
    df = None
    journal_titles = []
    print(f"Error loading journals.csv: {e}")

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/quartile', methods=['GET'])
def get_quartile():
    journal = request.args.get('journal', '')
    if not journal or df is None:
        return jsonify({'quartile': None, 'match': None, 'score': 0, 'sjr': None, 'impact_factor': None, 'open_access': None, 'sjr_url': None})

    # Fuzzy match journal name
    match, score = process.extractOne(journal, journal_titles)
    if score < 80:  # Threshold for match quality
        return jsonify({'quartile': None, 'match': match, 'score': score, 'sjr': None, 'impact_factor': None, 'open_access': None, 'sjr_url': None})

    row = df.loc[df['Title'] == match].iloc[0] if not df.loc[df['Title'] == match].empty else None
    quartile = row['SJR Best Quartile'] if row is not None else None
    sjr = row['SJR'] if row is not None and 'SJR' in row else None
    # Impact Factor is not always present; try to get it if available
    impact_factor = row['Impact Factor'] if row is not None and 'Impact Factor' in row else None
    # Open Access status: try to infer from Publisher or Coverage columns
    open_access = None
    if row is not None:
        for col in ['Open Access', 'Coverage', 'Publisher']:
            if col in row and isinstance(row[col], str) and 'open access' in row[col].lower():
                open_access = 'Yes'
    # Build SJR URL
    sjr_url = f"https://www.scimagojr.com/journalsearch.php?q={row['Sourceid']}" if row is not None and 'Sourceid' in row else None

    return jsonify({
        'quartile': quartile,
        'match': match,
        'score': score,
        'sjr': sjr,
        'impact_factor': impact_factor,
        'open_access': open_access,
        'sjr_url': sjr_url
    })

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

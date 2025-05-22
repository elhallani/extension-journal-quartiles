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
        return jsonify({'quartile': None, 'match': None, 'score': 0})

    # Fuzzy match journal name
    match, score = process.extractOne(journal, journal_titles)
    if score < 80:  # Threshold for match quality
        return jsonify({'quartile': None, 'match': match, 'score': score})

    # Use the correct column name for quartile
    quartile = df.loc[df['Title'] == match, 'SJR Best Quartile'].values
    quartile = quartile[0] if len(quartile) > 0 else None

    return jsonify({'quartile': quartile, 'match': match, 'score': score})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)

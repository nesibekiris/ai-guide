import os
import requests

# If your code (or an old library) needs `url_quote`, we get it here:
from urllib.parse import quote as url_quote

from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Hugging Face Inference API Settings
HUGGINGFACE_API_TOKEN = os.environ.get('HUGGINGFACE_API_TOKEN', '')
API_URL = "https://api-inference.huggingface.co/models/OpenAssistant/oasst-sft-4-pythia-12b-epoch-3.5"

headers = {
    "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
    "Content-Type": "application/json"
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    """
    Weighted scoring logic for AI readiness sections.
    """
    questions_by_section = {
        "Organizational Strategy and Readiness": {
            "questions": ["org_q1", "org_q2"],
            "weight": 1.5,
            "max_points": 2
        },
        "Data Preparedness": {
            "questions": ["data_q1", "data_q2"],
            "weight": 1.0,
            "max_points": 2
        }
    }

    section_scores = {}
    total_weight = 0
    weighted_sum = 0

    for section, data in questions_by_section.items():
        q_list = data["questions"]
        weight = data["weight"]
        max_points = data["max_points"]

        section_score = 0.0
        for q in q_list:
            answer = request.form.get(q, "No")
            if answer == "Yes":
                section_score += 1
            elif answer == "Partial":
                section_score += 0.5

        normalized_score = section_score / max_points
        weighted_contribution = normalized_score * weight
        weighted_sum += weighted_contribution
        total_weight += weight
        section_scores[section] = normalized_score

    composite_score = weighted_sum / total_weight if total_weight > 0 else 0
    composite_percentage = composite_score * 100

    if composite_percentage >= 80:
        indicator = "Green"
    elif composite_percentage >= 50:
        indicator = "Yellow"
    else:
        indicator = "Red"

    return jsonify({
        "section_scores": section_scores,
        "composite_score": composite_percentage,
        "indicator": indicator
    })

@app.route('/chat', methods=['POST'])
def chat():
    """
    A chat endpoint calling Hugging Face Inference API (OpenAssistant model).
    """
    user_message = request.form.get('message', '').strip()
    if not user_message:
        return jsonify({"answer": "Please ask a question."})

    prompt = (
        f"You are an AI assistant helping with AI readiness. "
        f"The user says: {user_message}\n"
        "Please provide a helpful, concise suggestion."
    )

    data = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 100,
            "temperature": 0.7
        }
    }

    response = requests.post(API_URL, headers=headers, json=data)
    print("DEBUG: HF API response status:", response.status_code)
    print("DEBUG: HF API response text:", response.text)

    if response.status_code == 200:
        result = response.json()
        if isinstance(result, list) and result and "generated_text" in result[0]:
            answer = result[0]["generated_text"]
            final_answer = answer.replace(prompt, "").strip()
            return jsonify({"answer": final_answer})
        else:
            return jsonify({"answer": "No valid response from model."})
    else:
        return jsonify({"answer": f"Error: {response.status_code}, {response.text}"}), 500

# Example usage of `url_quote` from urllib.parse if needed:
# def some_function():
#     encoded = url_quote("This is a test string with spaces & special chars!")
#     print(encoded)  # e.g. "This%20is%20a%20test%20string%20with%20spaces%20%26%20special%20chars%21"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

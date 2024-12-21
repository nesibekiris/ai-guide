from flask import Flask, render_template, request, jsonify
import os
import openai

app = Flask(__name__)

# OpenAI API key from environment
openai.api_key = os.environ.get('OPENAI_API_KEY', '')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    # Define sections, their questions, and weights
    # Add or remove sections and questions as you expand the checklist.
    questions_by_section = {
        "Organizational Strategy and Readiness": {
            "questions": ["org_q1", "org_q2"],
            "weight": 1.5,   # High priority section
            "max_points": 2   # 2 questions, each max 1 point if "Yes"
        },
        "Data Preparedness": {
            "questions": ["data_q1", "data_q2"],
            "weight": 1.0,   # Medium priority
            "max_points": 2
        }
        # Add more sections similarly...
    }

    # Calculate scores
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
            # No adds 0

        # Normalize section score (0 to 1)
        normalized_score = section_score / max_points

        # Weighted contribution
        weighted_contribution = normalized_score * weight
        weighted_sum += weighted_contribution
        total_weight += weight

        # Store normalized scores in the results
        section_scores[section] = normalized_score

    # Compute the composite readiness score (0 to 1)
    composite_score = weighted_sum / total_weight if total_weight > 0 else 0
    composite_percentage = composite_score * 100

    # Determine traffic light indicator based on composite score
    if composite_percentage >= 80:
        indicator = "Green"
    elif composite_percentage >= 50:
        indicator = "Yellow"
    else:
        indicator = "Red"

    # Return JSON with section-wise normalized scores, composite score, and indicator
    # We'll use normalized scores (0-1) for the radar chart.
    return jsonify({
        "section_scores": section_scores,
        "composite_score": composite_percentage,
        "indicator": indicator
    })

@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.form.get('message', '').strip()
    if not openai.api_key:
        return jsonify({"answer": "OpenAI API key not set. Please configure it on Render."})

    prompt = (
        "You are an AI consultant helping organizations improve their AI readiness. "
        "The user has asked: " + user_message + ". Provide a concise and actionable suggestion."
    )

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150,
        temperature=0.7
    )
    answer = response.choices[0].text.strip()
    return jsonify({"answer": answer})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)

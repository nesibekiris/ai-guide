from flask import Flask, render_template, request, jsonify
import os
import openai

app = Flask(__name__)

# Set your OpenAI API key via Render’s environment variable
openai.api_key = os.environ.get('OPENAI_API_KEY', '')

@app.route('/')
def index():
    # Renders the main page with the checklist form
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    # Extract form data and calculate scores
    # For demonstration, we’ll use a small sample of questions. 
    # You should expand this based on your checklist needs.

    # Example sections and questions:
    # Adjust these as you add more sections/questions
    questions_by_section = {
        "Organizational Strategy and Readiness": ["org_q1", "org_q2"],
        "Data Preparedness": ["data_q1", "data_q2"]
        # Add more sections and questions here
    }

    results = {}
    for section, questions in questions_by_section.items():
        section_score = 0
        count = len(questions)
        for q in questions:
            answer = request.form.get(q, "No")
            if answer == "Yes":
                section_score += 1
            elif answer == "Partial":
                section_score += 0.5
            # No = 0 points, so no addition
        # You can use total score or an average, here we’ll just use the total score
        results[section] = section_score

    return jsonify(results)

@app.route('/chat', methods=['POST'])
def chat():
    # Get the user’s question and scores
    user_message = request.form.get('message', '')
    # In a real scenario, you might also include user scores in the prompt
    # For now, we’ll just demonstrate a simple prompt
    prompt = f"You are an AI expert helping organizations improve their AI readiness. The user says: {user_message}. Give a helpful, concise suggestion."

    if openai.api_key == '':
        # If no API key is set, return a placeholder message
        return jsonify({"answer": "OpenAI API key not set. Please configure it on Render."})

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

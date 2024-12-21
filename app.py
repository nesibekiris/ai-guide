from flask import Flask, render_template, request, jsonify
import os
import openai

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')  # Will show a basic page

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080)

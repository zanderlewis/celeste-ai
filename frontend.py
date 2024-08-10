from flask import Flask, request, jsonify, render_template, Response, redirect, url_for
import ollama
import json
import markup


ai_content = ""

model = "llama3"
history = [
    {"role": "system", "content": ai_content},
]

app = Flask(__name__)


@app.route("/")
def index():
    if len(history) > 1:
        history.clear()
    characters = json.load(open("characters.json"))
    return render_template("index.html", characters=characters)

@app.route("/chat/<unique_id>")
def chat(unique_id):
    characters = json.load(open("characters.json"))
    ai = next((character for character in characters if character["unique_id"] == unique_id), None)
    if ai:
        ai_content = ai["description"]
        history[0]["content"] = ai_content
        name = ai["name"]
        return render_template("chat.html", history=history, name=name)
    else:
        return "Character not found", 404


@app.route("/send", methods=["POST"])
def send():
    message = {"role": "user", "content": request.json["message"]}
    history.append(message)

    def generate():
        full_response = ""
        buffer = ""
        for response in ollama.chat(model=model, messages=history, stream=True):
            chunk = response["message"]["content"]
            buffer += chunk

            # Check if buffer contains an even number of '*'
            if buffer.count('*') % 2 == 0:
                full_response += buffer
                buffer = markup.markup(buffer)
                yield buffer
                buffer = ""

        full_response += buffer
        yield buffer

        full_response = markup.markup(full_response)
        m = {"role": "assistant", "content": full_response}
        history.append(m)

    return Response(generate(), mimetype="text/event-stream")


@app.route("/history", methods=["GET"])
def get_history():
    if len(history) > 1:
        return jsonify(history[1:])
    return jsonify([])

@app.route("/chat/static/js/app.js")
def app_js():
    return redirect(url_for('static', filename='js/app.js'))

@app.route("/print_history")
def print_history():
    print(json.dumps(history, indent=2))
    return "History printed in console"

@app.route("/markup", methods=["POST"])
def markup_text():
    text = request.json["text"]
    m = markup.markup(text)
    print(m)
    return jsonify({"markup": m})

if __name__ == "__main__":
    app.run(debug=True, threaded=True)

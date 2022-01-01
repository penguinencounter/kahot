from flask import Flask, render_template, Response
from flow import get_token
app = Flask(__name__)

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/token/<game_pin>')
def token_gen(game_pin):
    return get_token(game_pin)

app.run('0.0.0.0', 8008, True)
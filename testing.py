from flask import Flask, render_template, Response
from flow import get_token
app = Flask(__name__)

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/token/<game_pin>')
def token_gen(game_pin):
    resp = Response(get_token(game_pin))
    resp.headers['Server'] = 'Kahot Token Server v1'
    return resp

app.run('0.0.0.0', 8008, True)
import typing

import flask_sock
from flask import Flask, render_template
from websockets import connect
from websockets.client import WebSocketClientProtocol
from websockets.exceptions import ConnectionClosed
from flow import get_token
from flask_sock import Sock
import asyncio as aio
from threading import Thread

app = Flask(__name__)
sock = Sock(app)


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/token/<game_pin>')
def token_gen(game_pin):
    return get_token(game_pin)


app.run(host='0.0.0.0', port=8008, debug=True)

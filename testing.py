from flask import Flask, render_template, Response, abort
from flow import get_token
from multiprocessing import Process
import mirror_server
import asyncio
app = Flask(__name__)
@app.route('/')
def main():
    return render_template('index.html')

@app.route('/token/<game_pin>')
def token_gen(game_pin):
    return get_token(game_pin)

@app.route('/cometd/<path:k>')
def doupgrade(k):
    resp = Response()
    resp.headers['Upgrade'] = "websocket"
    return resp, 101

def action():
    asyncio.run(mirror_server.main())

p = Process(target=action)
p.start()
app.run(host='0.0.0.0', port=8008, debug=True)
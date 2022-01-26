import websockets
import asyncio
from threading import Thread
import re


async def echo(ws, path):
    print(f"ws connected to {path}")
    content = await ws.recv()
    print(f"<<< {content}")
    await ws.send(content)
    print(f">>> {content}")


async def proxy(ws: websockets.WebSocketServerProtocol, path: str):
    md = re.match(r'/cometd/(\d+)/(.+)', path)
    if md == None:
        await ws.send("error connecting: invalid path")
        await ws.close()
    uri = f'wss://kahoot.it/cometd/{md.group(1)}/{md.group(2)}'
    extconn = await websockets.connect(uri)
    async def server_to_client(
        extsock: websockets.WebSocketClientProtocol,
        intsock: websockets.WebSocketServerProtocol
    ):
        try:
            while True:
                await intsock.send(await extsock.recv())
        except websockets.exceptions.ConnectionClosed:
            intsock.close(1000)
    async def client_to_server(
        extsock: websockets.WebSocketClientProtocol,
        intsock: websockets.WebSocketServerProtocol
    ):
        try:
            while True:
                await extsock.send(await intsock.recv())
        except websockets.exceptions.ConnectionClosed:
            extsock.close(1000)
    
    t1 = Thread(target=server_to_client, args=(extconn, ws))
    t2 = Thread(target=client_to_server, args=(extconn, ws))
    t1.start()
    t2.start()
    threads = [t1, t2]
    # Hang until any thread completes.
    while True:
        await asyncio.sleep(0.1)
        for t in threads:
            if not t.is_alive():
                ws.close(1000)
                extconn.close(1000)
                return


async def main():
    async with websockets.serve(proxy, "0.0.0.0", 8765):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    asyncio.run(main())

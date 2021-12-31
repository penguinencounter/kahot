// Interact with the local token servers for handling.

async function getTokenFor(pin) {
    return await fetch("/token/"+pin).then(resp => resp.text())
}

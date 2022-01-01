// Interact with the local token servers for handling.

async function getInfoFor(pin) {
    return await fetch("/token/"+pin).then(resp => resp.json())
}

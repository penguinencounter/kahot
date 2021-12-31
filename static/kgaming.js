function processForm(e) {
    let pin_box = document.getElementById("game_pin");
    let username_box = document.getElementById("username");
    autoConnect(pin_box.value, username_box.value);
    switchPane("loading");
    e.preventDefault();
    return false;
}

function attachEvents() {
    let pin_attach = document.getElementById("pin_name");
    pin_attach.addEventListener("submit", processForm);
}

function switchPane(paneid) {
    Array(...document.getElementsByClassName("panes")).forEach(e => e.classList.add("disabled"))
    document.getElementById(paneid).classList.remove("disabled");
}

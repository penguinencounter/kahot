function processPinForm(e) {
    let pin_box = document.getElementById("game_pin");
    autoConnect(pin_box.value);
    setHeaderRight(pin_box.value);
    setHeaderLeft('...')
    setLoadMessage("Connecting to Kahoot!...")
    switchPane("loading");
    e.preventDefault();
    return false;
}

function processNickForm(e) {
    let nick_box = document.getElementById("nickname");
    usernameLogin(nick_box.value);
    setHeaderLeft(nick_box.value);
    setLoadMessage("Joining game...")
    switchPane("loading");
    e.preventDefault();
    addPacketListener("USERNAME_ACCEPTED", function (com, pin, name, content) {
        switchPane("await_start");
    });
    return false;
}

function attachEvents() {
    let pin_attach = document.getElementById("pin");
    pin_attach.addEventListener("submit", processPinForm);
    let uname_attach = document.getElementById("nick");
    uname_attach.addEventListener("submit", processNickForm);
    addPacketListener("RESET_CONTROLLER", function (com, pin, name, content) {
        switchPane("enter_pin");
    })
}

function switchPane(paneid) {
    Array(...document.getElementsByClassName("panes")).forEach(e => e.classList.add("disabled"))
    document.getElementById(paneid).classList.remove("disabled");
}

function setLoadMessage(message) {
    document.getElementById("loadtext").innerHTML = message;
}

function setHeaderLeft(message) {
    document.getElementById("info_left").innerHTML = message;
}

function setHeaderRight(message) {
    document.getElementById("info_right").innerHTML = message;
}

async function namerator_gen() {
    let generated_name = await fetch("https://apis.kahoot.it").then(e => e.json()).then(json => json.name);
    let container = document.createElement("div");
    container.classList.add("namerator_item");
    let nametag = document.createElement("span");
    nametag.innerHTML = generated_name;
    container.appendChild(nametag);
    let button = document.createElement("div");
    button.classList.add("namerator_button");
    container.appendChild(button)
    document.getElementById("namerator_names").appendChild(container);
}

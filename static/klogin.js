// AFTER cometd.js
let association = {
    "GET_READY": [],
	"START_QUESTION": [],
	"GAME_OVER": [],
	"TIME_UP": [],
    "PLAY_AGAIN": [],
	"ANSWER_SELECTED": [],
	"ANSWER_RESPONSE": [],
	"REVEAL_ANSWER": [],
	"START_QUIZ": [],
	"RESET_CONTROLLER": [],
	"SUBMIT_FEEDBACK": [],
	"FEEDBACK": [],
	"REVEAL_RANKING": [],
	"USERNAME_ACCEPTED": [],
	"USERNAME_REJECTED": [],
	"REQUEST_RECOVERY_DATA_FROM_PLAYER": [],
	"SEND_RECOVERY_DATA_TO_CONTROLLER": [],
	"JOIN_TEAM_MEMBERS": [],
	"JOIN_TEAM_MEMBERS_RESPONSE": [],
	"START_TEAM_TALK": [],
	"SKIP_TEAM_TALK": [],
	"IFRAME_CONTROLLER_EVENT": [],
	"SERVER_IFRAME_EVENT": [],
	"STORY_BLOCK_GET_READY": [],
	"REACTION_SELECTED": [],
	"REACTION_RESPONSE": [],
	"GAME_BLOCK_START": [],
	"GAME_BLOCK_END": [],
	"GAME_BLOCK_ANSWER": [],
	"SUBMIT_TWO_FACTOR": [],
	"TWO_FACTOR_AUTH_INCORRECT": [],
	"TWO_FACTOR_AUTH_CORRECT": [],
	"RESET_TWO_FACTOR_AUTH": [],
}

let cQueue = [];
let pQueue = [];
let sQueue = [];
let isAnswerActive = false;
let currentQuestionType = null;

let handlers = {
    "GET_READY": [],
	"START_QUESTION": [],
	"GAME_OVER": [],
	"TIME_UP": [],
    "PLAY_AGAIN": [],
	"ANSWER_SELECTED": [],
	"ANSWER_RESPONSE": [],
	"REVEAL_ANSWER": [],
	"START_QUIZ": [],
	"RESET_CONTROLLER": [],
	"SUBMIT_FEEDBACK": [],
	"FEEDBACK": [],
	"REVEAL_RANKING": [],
	"USERNAME_ACCEPTED": [],
	"USERNAME_REJECTED": [],
	"REQUEST_RECOVERY_DATA_FROM_PLAYER": [],
	"SEND_RECOVERY_DATA_TO_CONTROLLER": [],
	"JOIN_TEAM_MEMBERS": [],
	"JOIN_TEAM_MEMBERS_RESPONSE": [],
	"START_TEAM_TALK": [],
	"SKIP_TEAM_TALK": [],
	"IFRAME_CONTROLLER_EVENT": [],
	"SERVER_IFRAME_EVENT": [],
	"STORY_BLOCK_GET_READY": [],
	"REACTION_SELECTED": [],
	"REACTION_RESPONSE": [],
	"GAME_BLOCK_START": [],
	"GAME_BLOCK_END": [],
	"GAME_BLOCK_ANSWER": [],
	"SUBMIT_TWO_FACTOR": [],
	"TWO_FACTOR_AUTH_INCORRECT": [],
	"TWO_FACTOR_AUTH_CORRECT": [],
	"RESET_TWO_FACTOR_AUTH": []
}

let comet_g = null;
let pin_g = null;


function klogin(game_pin, token, desiredUsername) {
    function debugHandler(message) {
        console.log(message.data);
    }
    function procC(message) {
        cQueue.push(message.data);
    }
    function procP(message) {
        pQueue.push(message.data);
    }
    function procS(message) {
        sQueue.push(message.data);
    }
    let comet = new org.cometd.CometD();
    comet.websocketEnabled = true
    comet.configure({
        'url': 'https://kahoot.it/cometd/'+game_pin+'/'+token
    });
    comet.handshake();
    comet.addListener('/service/controller', debugHandler);
    comet.addListener('/service/player', debugHandler);
    comet.addListener('/service/status', debugHandler);

    comet.addListener('/service/controller', procC);
    comet.addListener('/service/player', procP);
    comet.addListener('/service/status', procS);
    comet.publish('/service/controller', 
        {"host": "kahoot.it", "gameid": String(game_pin), "name": desiredUsername, "type": "login"}
    );
    comet_g = comet
    pin_g = game_pin
    setInterval(processPlayerQueue, 1, comet, game_pin)
}


function send_answer(choice, comet, pin) {
    if (!isAnswerActive) {
        console.error('send_answer: answering not currently allowed');
        return false;
    }
    console.info('Answering with '+choice);
    let answer_data;
    if (typeof choice === "object") {
        if (currentQuestionType === "multiple_select_quiz") {
            answer_data = {
                "choice": choice,
                "meta": {"lag": 0, "device": {"userAgent": "kahot-dev", "screen": {"width": 1920, "height": 1080}}}
            };
        } else {
            console.warn("Invalid question type!");
            return false;
        }
    } else {
        if (currentQuestionType === "quiz") {
            answer_data = {
                "choice": choice,
                "meta": {"lag": 0, "device": {"userAgent": "kahot-dev", "screen": {"width": 1920, "height": 1080}}}
            };
        } else if (currentQuestionType === "multiple_select_quiz") {
            answer_data = {
                "choice": [choice],
                "meta": {"lag": 0, "device": {"userAgent": "kahot-dev", "screen": {"width": 1920, "height": 1080}}}
            };
        } else {
            console.warn("Invalid question type!");
            return false;
        }
    }
    comet.publish('/service/controller', {
        "content": JSON.stringify(answer_data),
        "gameid": String(pin),
        "host": "kahoot.it",
        "type": "message",
        "id": 45
    })
    console.info('Answers no longer accepted.')
    isAnswerActive = false;
    return true;
}


function processPlayerQueue(comet, pin) {
    if (pQueue.length === 0) {
        return -1;
    }
    let processing = pQueue.shift();
    let content = JSON.parse(processing["content"])
    if (!processing.id) {
        console.error('Error while processing player queue: No id found. Details below...');
        console.error(processing);
        return 0;
    }
    let hr_name = association[processing.id]
    console.info('Recv '+hr_name);
    if (hr_name === "START_QUESTION") {
        console.info('Answers now accepted.');
        console.info('Question type is '+content["type"]);
        currentQuestionType = content["type"];
        isAnswerActive = true;
    }
    if (hr_name === "TIME_UP") {
        console.info('Answers no longer accepted.');
        isAnswerActive = false;
    }
    if (hr_name === "RESET_CONTROLLER") {
        console.warn('Recieved RESET_CONROLLER signal, disconnecting...');
        comet.disconnect();
    }
    return 1;
}


function autoConnect(game_pin, username) {
    getTokenFor(game_pin).then(function(token) {
        if (token.startsWith('$ERROR')) {
            console.error('Error getting game token. Sorry!');
            return false;
        }
        klogin(game_pin, token, username);
        return true;
    })
}

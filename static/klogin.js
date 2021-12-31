// AFTER cometd.js
let association = {
    1: "GET_READY",
	2: "START_QUESTION",
	3: "GAME_OVER",
	4: "TIME_UP",
    5: "PLAY_AGAIN",
	6: "ANSWER_SELECTED",
	7: "ANSWER_RESPONSE",
	8: "REVEAL_ANSWER",
	9: "START_QUIZ",
	10: "RESET_CONTROLLER",
	11: "SUBMIT_FEEDBACK",
	12: "FEEDBACK",
	13: "REVEAL_RANKING",
	14: "USERNAME_ACCEPTED",
	15: "USERNAME_REJECTED",
	16: "REQUEST_RECOVERY_DATA_FROM_PLAYER",
	17: "SEND_RECOVERY_DATA_TO_CONTROLLER",
	18: "JOIN_TEAM_MEMBERS",
	19: "JOIN_TEAM_MEMBERS_RESPONSE",
	20: "START_TEAM_TALK",
	21: "SKIP_TEAM_TALK",
	31: "IFRAME_CONTROLLER_EVENT",
	32: "SERVER_IFRAME_EVENT",
	40: "STORY_BLOCK_GET_READY",
	41: "REACTION_SELECTED",
	42: "REACTION_RESPONSE",
	43: "GAME_BLOCK_START",
	44: "GAME_BLOCK_END",
	45: "GAME_BLOCK_ANSWER",
	50: "SUBMIT_TWO_FACTOR",
	51: "TWO_FACTOR_AUTH_INCORRECT",
	52: "TWO_FACTOR_AUTH_CORRECT",
	53: "RESET_TWO_FACTOR_AUTH"
}

let cQueue = [];
let pQueue = [];
let sQueue = [];
let isAnswerActive = false;
let currentQuestionType = null;

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
        console.info('Answers now accepted.')
        console.info('Question type is '+content["type"])
        currentQuestionType = content["type"]
        isAnswerActive = true;
    }
    if (hr_name === "TIME_UP") {
        console.info('Answers no longer accepted.')
        isAnswerActive = false;
    }
    return 1;
}

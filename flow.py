import requests
import re
import base64


def shenanigans(challenge_data: str):
    print(f'  Cue the shenanigans\n  Dissecting script data')
    r = r"^decode\.call\(this, '([a-zA-Z0-9]*)'\); function decode\(message\) \{var offset = ([0-9\+\*\(\)\s]*);"
    sections = re.search(r, challenge_data).groups()
    offset = eval(re.sub(r"\s+", " ", sections[1]))
    decoded_challenge_mask = ''
    print(f'  Doing some math')
    for i, char in enumerate(sections[0]):
        decoded_challenge_mask += chr(
            (((ord(char) * i)
            + offset)
            % 77)
            + 48
        )
    print(f'  Done {decoded_challenge_mask}')
    return decoded_challenge_mask


def masking(challenge_mask: str, token_data: bytes):
    out = ''
    for i, char in enumerate(token_data):
        out += chr(char ^ ord(challenge_mask[i % len(challenge_mask)]))
    return out


def get_token(quizID: str):
    uri = f'https://kahoot.it/reserve/session/{quizID}/'
    print('Connecting to Kahoot!\'s servers...')
    r = requests.get(uri)
    if r.status_code != 200:
        return f'$ERROR {r.status_code}'
    print('Reading data')
    session_token_encoded = r.headers['x-kahoot-session-token']
    challenge_data = r.json()['challenge']
    print('Solving challenge')
    challenge_mask = shenanigans(challenge_data)
    print('Decoding token')
    decode_step_1 = base64.decodebytes(bytes(session_token_encoded, encoding='UTF-8'))
    decode_step_2 = masking(challenge_mask, decode_step_1)
    print(f'Done: {decode_step_2}')
    return decode_step_2


if __name__ == "__main__":
    print(get_token(input('ID> ')))

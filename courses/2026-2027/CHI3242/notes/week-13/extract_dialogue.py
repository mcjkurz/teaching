"""Find every line of dialogue in a passage of a novel, with its speaker (CHI3242, Week 13).

Usage:  python extract_dialogue.py     (reads paragraph.txt, writes dialogue.json and dialogue.csv)
The API key is read from the environment variable OPENAI_API_KEY.
"""
import csv
import json
import os

from openai import OpenAI  # pip install openai

BASE_URL = "https://openrouter.ai/api/v1"
MODEL = "qwen/qwen3.5-9b"

INSTRUCTIONS = (
    "List every line of direct speech in the passage (the words inside 「」), in order. "
    "For each line give: speaker = the name of the character who says it; when the narrator speaks as 我, "
    "give the narrator's name if the passage lets you infer it; "
    "mention = the word the passage uses for the speaker just before the line (for example 我, 她, or a name); "
    "text = the words inside 「」, without the brackets. "
    "Sounds and actions such as 嗯了一聲 are not speech. Use only the passage. Keep everything in Chinese."
)

SCHEMA = {
    "type": "object",
    "properties": {
        "utterances": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "speaker": {"type": "string"},
                    "mention": {"type": "string"},
                    "text": {"type": "string"},
                },
                "required": ["speaker", "mention", "text"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["utterances"],
    "additionalProperties": False,
}

# One-shot example: a short passage from the same novel and the answer we would like for it
EXAMPLE_TEXT = (
    "她那時滿臉是汗，直起腰來還埋怨我：「你幹你的，過來幹什麼？」她是怕我這麼一過去，別人都注意她了，我說：「你自己留意著身體。」"
    "她急了，說：「你快走開。」我搖搖頭，只好走開。……家珍哭了，她說：「福貴，我還能養活自己嗎？」「能。」我說。"
)
EXAMPLE_ANSWER = {
    "utterances": [
        {"speaker": "家珍", "mention": "她", "text": "你幹你的，過來幹什麼？"},
        {"speaker": "福貴", "mention": "我", "text": "你自己留意著身體。"},
        {"speaker": "家珍", "mention": "她", "text": "你快走開。"},
        {"speaker": "家珍", "mention": "她", "text": "福貴，我還能養活自己嗎？"},
        {"speaker": "福貴", "mention": "我", "text": "能。"},
    ]
}


def extract(passage):
    client = OpenAI(base_url=BASE_URL, api_key=os.environ["OPENAI_API_KEY"], timeout=120)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": INSTRUCTIONS},
            {"role": "user", "content": EXAMPLE_TEXT},
            {"role": "assistant", "content": json.dumps(EXAMPLE_ANSWER, ensure_ascii=False)},
            {"role": "user", "content": passage},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "dialogue", "strict": True, "schema": SCHEMA},
        },
        extra_body={"reasoning": {"enabled": False}},
    )
    return json.loads(response.choices[0].message.content)


if __name__ == "__main__":
    with open("paragraph.txt", encoding="utf-8") as f:
        passage = f.read().strip()
    result = extract(passage)
    text = json.dumps(result, ensure_ascii=False, indent=2)
    print(text)
    with open("dialogue.json", "w", encoding="utf-8") as f:
        f.write(text + "\n")
    with open("dialogue.csv", "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["id", "speaker", "mention", "text"])
        for i, u in enumerate(result["utterances"], start=1):
            writer.writerow([i, u["speaker"], u["mention"], u["text"]])

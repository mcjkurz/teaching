"""Turn a paragraph about a historical person into a JSON record (DHG 502, Week 11).

Usage:  python extract.py              (reads paragraph.txt, writes record.json)
The API key is read from the environment variable OPENAI_API_KEY.
"""
import json
import os

from openai import OpenAI  # pip install openai

BASE_URL = "https://openrouter.ai/api/v1"
MODEL = "qwen/qwen3.5-9b"

INSTRUCTIONS = (
    "Extract information about the person described in the paragraph. "
    "Return JSON that follows the schema. Use only facts stated in the paragraph. "
    "Write null when the paragraph does not say."
)

SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "name_zh": {"type": ["string", "null"]},
        "birth_year": {"type": ["integer", "null"]},
        "death_year": {"type": ["integer", "null"]},
        "events": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "year": {"type": ["integer", "null"]},
                    "place": {"type": ["string", "null"]},
                    "event": {"type": "string"},
                },
                "required": ["year", "place", "event"],
                "additionalProperties": False,
            },
        },
    },
    "required": ["name", "name_zh", "birth_year", "death_year", "events"],
    "additionalProperties": False,
}

# One-shot example: a paragraph and the record we would like for it
EXAMPLE_TEXT = (
    "Liang Qichao 梁啟超 was born in 1873 in Xinhui, Guangdong. After the Hundred Days' "
    "Reform failed in 1898, he fled to Japan, where he founded the journal 新民叢報 in 1902. "
    "He died in Beijing in 1929."
)
EXAMPLE_RECORD = {
    "name": "Liang Qichao",
    "name_zh": "梁啟超",
    "birth_year": 1873,
    "death_year": 1929,
    "events": [
        {"year": 1873, "place": "Xinhui", "event": "born"},
        {"year": 1898, "place": "Japan", "event": "fled to Japan after the failed reform"},
        {"year": 1902, "place": "Japan", "event": "founded the journal Xinmin congbao"},
        {"year": 1929, "place": "Beijing", "event": "died"},
    ],
}


def extract(paragraph):
    client = OpenAI(base_url=BASE_URL, api_key=os.environ["OPENAI_API_KEY"], timeout=120)
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": INSTRUCTIONS},
            {"role": "user", "content": EXAMPLE_TEXT},
            {"role": "assistant", "content": json.dumps(EXAMPLE_RECORD, ensure_ascii=False)},
            {"role": "user", "content": paragraph},
        ],
        response_format={
            "type": "json_schema",
            "json_schema": {"name": "person", "strict": True, "schema": SCHEMA},
        },
        extra_body={"reasoning": {"enabled": False}},
    )
    return json.loads(response.choices[0].message.content)


if __name__ == "__main__":
    with open("schema.json", "w", encoding="utf-8") as f:
        json.dump(SCHEMA, f, indent=2)
    with open("paragraph.txt", encoding="utf-8") as f:
        paragraph = f.read().strip()
    record = extract(paragraph)
    text = json.dumps(record, ensure_ascii=False, indent=2)
    print(text)
    with open("record.json", "w", encoding="utf-8") as f:
        f.write(text + "\n")

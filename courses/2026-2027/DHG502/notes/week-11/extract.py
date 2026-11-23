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
    "Write null when the paragraph does not say. Keep the values in the language of the paragraph."
)

SCHEMA = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
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
    "required": ["name", "birth_year", "death_year", "events"],
    "additionalProperties": False,
}

# One-shot example: a paragraph and the record we would like for it
EXAMPLE_TEXT = "梁啟超，1873年生於廣東新會。1898年戊戌變法失敗後，他流亡日本，1902年在日本創辦《新民叢報》。1929年在北京逝世。"
EXAMPLE_RECORD = {
    "name": "梁啟超",
    "birth_year": 1873,
    "death_year": 1929,
    "events": [
        {"year": 1873, "place": "廣東新會", "event": "出生"},
        {"year": 1898, "place": "日本", "event": "戊戌變法失敗後流亡日本"},
        {"year": 1902, "place": "日本", "event": "創辦《新民叢報》"},
        {"year": 1929, "place": "北京", "event": "逝世"},
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

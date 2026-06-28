import json
import re
from typing import Optional, List
import anthropic
from app.core.config import settings
from app.prompts.lease_analysis import LEASE_ANALYSIS_PROMPT
from app.prompts.chat import CHAT_SYSTEM_PROMPT, CHAT_DISCLAIMER
from app.prompts.documents import DOCUMENT_PROMPTS

client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)

LANGUAGE_NAMES = {
    "en": "English",
    "ar": "Arabic",
    "ur": "Urdu",
    "hi": "Hindi",
}


async def analyze_lease(lease_text: str, language: str = "en") -> dict:
    lang_name = LANGUAGE_NAMES.get(language, "English")
    prompt = LEASE_ANALYSIS_PROMPT.format(lease_text=lease_text[:12000], language=lang_name)

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text
    json_match = re.search(r"\{.*\}", response_text, re.DOTALL)
    if not json_match:
        raise ValueError("Claude did not return valid JSON")

    return json.loads(json_match.group())


async def chat_with_assistant(
    message: str,
    language: str = "en",
    history: List = None,
    analysis_context: Optional[str] = None,
) -> str:
    lang_name = LANGUAGE_NAMES.get(language, "English")
    disclaimer = CHAT_DISCLAIMER.get(language, CHAT_DISCLAIMER["en"])
    context = f"User's lease analysis summary: {analysis_context}" if analysis_context else "No specific lease context."

    system_prompt = CHAT_SYSTEM_PROMPT.format(
        language=lang_name,
        disclaimer=disclaimer,
        context=context,
    )

    messages = []
    if history:
        for msg in history[-10:]:
            role = "user" if msg.role.value == "USER" else "assistant"
            messages.append({"role": role, "content": msg.content})

    messages.append({"role": "user", "content": message})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )

    return response.content[0].text


async def generate_document(doc_type: str, input_data: dict, language: str = "en") -> tuple[str, str]:
    template = DOCUMENT_PROMPTS.get(doc_type)
    if not template:
        raise ValueError(f"Unknown document type: {doc_type}")

    lang_name = LANGUAGE_NAMES.get(language, "English")
    input_str = "\n".join(f"{k}: {v}" for k, v in input_data.items())
    prompt = template["prompt"].format(input_data=input_str, language=lang_name)

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    content = response.content[0].text
    title = template["title"]
    return content, title

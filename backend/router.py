import os
import sys
import pathlib
from groq import Groq
from dotenv import load_dotenv

env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

sys.path.append(str(pathlib.Path(__file__).parent / "memory"))
from vector_store import search_knowledge

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
MODEL = "llama-3.3-70b-versatile"

PROMPTS = {
    "hr": "You are an HR specialist. Handle leave requests and policy questions professionally.",
    "support": "You are a support specialist. Diagnose issues and provide clear solutions.",
    "finance": "You are a finance specialist. Handle expenses and invoices accurately.",
    "security": "You are a security specialist. Handle access requests and security policies.",
}

def get_category(text: str) -> str:
    client = Groq(api_key=GROQ_API_KEY)
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=5,
        messages=[{"role": "user", "content": f"Classify into ONE word - hr, support, finance, or security:\n{text}"}]
    )
    result = response.choices[0].message.content.strip().lower()
    for cat in ["hr", "finance", "security", "support"]:
        if cat in result:
            return cat
    return "support"

def get_response(category: str, text: str) -> str:
    client = Groq(api_key=GROQ_API_KEY)

    # RAG — retrieve relevant knowledge
    context = search_knowledge(text)
    
    system_prompt = PROMPTS[category]
    if context:
        system_prompt += f"\n\nUse this company knowledge to answer:\n{context}"

    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=300,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": text}
        ]
    )
    return response.choices[0].message.content.strip()

async def route_event(text: str) -> dict:
    category = get_category(text)
    response = get_response(category, text)
    return {
        "agent": f"{category.upper()} Agent",
        "category": category,
        "response": response,
        "confidence": 92,
        "status": "resolved",
        "action_taken": "auto-resolved"
    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from router import route_event

app = FastAPI(title="AI Enterprise Autopilot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Event(BaseModel):
    text: str

@app.get("/")
def root():
    return {"status": "AI Autopilot is running"}

@app.post("/api/process")
async def process_event(event: Event):
    result = await route_event(event.text)
    return result
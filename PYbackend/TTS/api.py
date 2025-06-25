from fastapi import FastAPI, HTTPException, Form
from fastapi.responses import FileResponse
import torch
import soundfile as sf
import tempfile
import os
from fastapi.middleware.cors import CORSMiddleware
from starlette.background import BackgroundTask
import numpy as np
import re
from fastapi.responses import StreamingResponse


app = FastAPI(title="English Text to Speech (Silero TTS)")

# CORS setup (allow your frontend to access the backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],  # <-- Replace with frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Silero TTS model
def load_model():
    model, _ = torch.hub.load(
        repo_or_dir='snakers4/silero-models',
        model='silero_tts',
        language='en',
        speaker='v3_en'
    )
    return model

model = load_model()
speakers = ['en_112', 'en_8', 'en_63', 'en_0']  # Available speaker options

# Helper: Split long text into small sentences for better audio
def split_text(text, max_len=1000):
    sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    chunks = []
    current_chunk = ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) <= max_len:
            current_chunk += (" " if current_chunk else "") + sentence
        else:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = sentence
    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

# Async cleanup function
async def cleanup(file_path: str):
    if os.path.exists(file_path):
        os.unlink(file_path)

@app.post("/generate_audio")
async def generate_audio(text: str = Form(...), speaker: str = Form(...)):
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    if speaker not in speakers:
        raise HTTPException(status_code=400, detail=f"Invalid speaker. Choose from {speakers}.")

    try:
        print(f"Generating audio for text length: {len(text)} and speaker: {speaker}")
        audio_segments = []
        chunks = split_text(text)
        print(f"Split into {len(chunks)} chunks")

        for i, chunk in enumerate(chunks):
            print(f"Generating chunk {i+1}: {chunk[:60]}...")
            segment = model.apply_tts(text=chunk, speaker=speaker, sample_rate=48000)
            audio_segments.append(segment)

        full_audio = np.concatenate(audio_segments)

        # Save audio to a temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        sf.write(temp_file.name, full_audio, 48000)
        temp_file_path = temp_file.name
        temp_file.close()

        return StreamingResponse(
        open(temp_file_path, "rb"),
        media_type="audio/wav",
        headers={"Content-Disposition": "attachment; filename=output.wav"},
        background=BackgroundTask(cleanup, temp_file_path)
        )

    except Exception as e:
        print("❌ Error generating audio:", str(e))
        if 'temp_file_path' in locals() and os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error generating audio: {str(e)}")

from google import genai
import os
import json

USE_SENTIMENT = True

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = "gemini-flash-latest"

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    SENTIMENT_AVAILABLE = True
    print("Sentiment Analysis (Gemini) Ready")
else:
    client = None
    SENTIMENT_AVAILABLE = False
    print("GEMINI_API_KEY not set. Sentiment Analysis Disabled.")

SENTIMENT_PROMPT = """Classify the sentiment of the following customer support email.

Categories: POSITIVE, NEGATIVE

Return ONLY a JSON object with exactly these two keys, nothing else:
{"sentiment": "<POSITIVE or NEGATIVE>", "confidence": <number between 0 and 1>}

Email:
{text}"""


def predict_sentiment(text):

    if not USE_SENTIMENT or not SENTIMENT_AVAILABLE:
        return {
            "sentiment": None,
            "confidence": 0.0
        }

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=SENTIMENT_PROMPT.format(text=text)
        )

        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("\n", 1)[1]
            raw = raw.rsplit("```", 1)[0].strip()

        result = json.loads(raw)

        sentiment = result.get("sentiment", "").upper()
        confidence = float(result.get("confidence", 0.0))

        if sentiment not in ("POSITIVE", "NEGATIVE"):
            sentiment = None
            confidence = 0.0

        return {
            "sentiment": sentiment,
            "confidence": round(confidence, 4)
        }

    except Exception as e:
        print(f"Sentiment Analysis Error: {e}")
        return {
            "sentiment": None,
            "confidence": 0.0
        }

import os

from google import genai
from dotenv import load_dotenv

load_dotenv()


class _ModelClient:
    def __init__(self, client: genai.Client, model_name: str):
        self._client = client
        self._model_name = model_name

    def generate_content(self, contents):
        return self._client.models.generate_content(
            model=self._model_name,
            contents=contents,
        )


def get_gemini_client(model_name: str = "gemini-flash-lite-latest") -> _ModelClient:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set in environment.")
    client = genai.Client(api_key=api_key)
    return _ModelClient(client, model_name)

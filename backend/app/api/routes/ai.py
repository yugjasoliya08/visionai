from fastapi import APIRouter, Depends
from pydantic import BaseModel
import asyncio
from app.core.gemini_client import client
from app.core.deps import get_current_user
from app.models.user import User
 
router = APIRouter(prefix="/ai", tags=["AI Assistance"])
 
class AIRequest(BaseModel):
    code: str
    message: str = ""
    language: str = "python"

async def process_ai_logic(code: str, mode: str, message: str = ""):
    """
    Central logic to handle AI requests.
    mode: 'chat' for conversation, 'suggest' for code completion.
    """
    if not client:
        return "⚠️ AI Client disconnected. Check .env"

    if mode == "chat":
        # System instructions for the Chat Panel
        prompt = (
            "You are VisionAI, an intelligent coding assistant. "
            "The user is asking a question in a side chat panel. "
            "Explain concepts clearly, provide code snippets if needed, and be helpful.\n\n"
            f"Context Code:\n{code}\n\n"
            f"User Question: {message}"
        )
        model_name = "gemini-2.5-flash" # Use 1.5 for higher free limits
    else:
        # Strict instructions for inline Code Completion
        prompt = (
            "You are an expert programmer. Complete the following code snippet. "
            "Return ONLY the code. No markdown, no backticks, no explanations.\n\n"
            f"CODE TO COMPLETE:\n{code}"
        )
        model_name = "gemini-2.5-flash"

    for attempt in range(3):
        try:
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=model_name, 
                    contents=prompt,
                ),
                timeout=20.0,
            )
            # Clean text
            text = response.text.strip() if response and response.text else "// No response"
            if mode == "suggest":
                text = text.replace("```python", "").replace("```cpp", "").replace("```java", "").replace("```", "").strip()
            return text

        except asyncio.TimeoutError:
            if attempt == 2:
                return "// Error: AI request timed out."
        except Exception as e:
            if "503" in str(e) and attempt < 2:
                await asyncio.sleep(2)
                continue
            if attempt == 2:
                return f"// AI Error: {str(e)[:100]}"
    
    return "// Error: AI request failed."
# --- ROUTE 1: Triggered by "AI Complete" Button ---
@router.post("/suggest")
async def get_ai_suggestion(request: AIRequest, current_user: User = Depends(get_current_user)):
    result = await process_ai_logic(request.code, mode="suggest")
    return {"suggestion": result}

# --- ROUTE 2: Triggered by Chat Panel "Ask" Button ---
@router.post("/chat")
async def get_ai_chat(request: AIRequest, current_user: User = Depends(get_current_user)):
    result = await process_ai_logic(request.code, mode="chat", message=request.message)
    return {"suggestion": result}

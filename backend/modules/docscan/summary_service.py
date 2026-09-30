"""
Disha — Document Summary Service
Takes OCR-extracted text and generates summaries, explanations,
and homework help using the tutor LLM.
"""
import logging
from backend.modules.tutor.tutor_service import tutor_service

logger = logging.getLogger("disha.summary")


class SummaryService:
    """
    Document summarization and homework help service.
    
    Pipeline: Scanned document → OCR text → LLM summarization/Q&A
    Uses the tutor service's LLM for generating summaries and explanations.
    """

    async def summarize(
        self,
        text: str,
        language: str = "en",
        mode: str = "summary",
    ) -> dict:
        """
        Generate a summary or explanation of the scanned document text.
        
        Args:
            text: Extracted text from OCR
            language: Target language for output
            mode: "summary" | "explain" | "quiz" | "translate"
            
        Returns:
            Dict with 'result', 'mode', 'original_length', 'result_length'
        """
        prompt_templates = {
            "summary": (
                f"Please summarize the following text in simple, easy-to-understand language:\n\n"
                f"---\n{text}\n---\n\n"
                f"Provide a clear, concise summary that a school student can understand."
            ),
            "explain": (
                f"Please explain the following text as if teaching a student:\n\n"
                f"---\n{text}\n---\n\n"
                f"Break it down into simple points. Use examples from everyday life."
            ),
            "quiz": (
                f"Based on the following text, create 5 multiple-choice quiz questions:\n\n"
                f"---\n{text}\n---\n\n"
                f"For each question, provide 4 options and mark the correct answer."
            ),
            "translate": (
                f"Translate the following text to {language}:\n\n"
                f"---\n{text}\n---"
            ),
        }

        prompt = prompt_templates.get(mode, prompt_templates["summary"])

        # Use the tutor service for LLM processing
        response = await tutor_service.chat(
            message=prompt,
            language=language,
            subject="general",
        )

        return {
            "result": response["response"],
            "mode": mode,
            "original_length": len(text),
            "result_length": len(response["response"]),
            "model_used": response["model_used"],
            "inference_time_ms": response["inference_time_ms"],
        }


# Global singleton
summary_service = SummaryService()

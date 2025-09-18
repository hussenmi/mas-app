from __future__ import annotations

import json
import logging
from typing import List

from groq import Groq

from config import Settings
from memory import SessionStore
from providers.base import ChatProvider, ChatResult
from tools import ToolRegistry

logger = logging.getLogger(__name__)


class GroqChatProvider(ChatProvider):
    def __init__(self, settings: Settings, session_store: SessionStore, tool_registry: ToolRegistry):
        super().__init__(settings, session_store, tool_registry)
        settings.ensure_groq_credentials()
        self._client = Groq(api_key=settings.groq_api_key)

    def generate(self, message: str, session_id: str) -> ChatResult:
        session = self.session_store.get(session_id)
        conversation = [{"role": "system", "content": self.settings.system_prompt}]
        if session.history:
            conversation.extend(session.history)
        conversation.append({"role": "user", "content": message})

        try:
            initial = self._client.chat.completions.create(
                model=self.settings.groq_model,
                messages=conversation,
                tools=self.tool_registry.as_openai_tools(),
                tool_choice="auto",
                temperature=self.settings.temperature,
                max_tokens=self.settings.max_output_tokens,
            )
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Groq completion failed: {exc}")
            raise

        choice = initial.choices[0]
        assistant_message = choice.message
        used_tools: List[str] = []

        if assistant_message.tool_calls:
            conversation.append(
                {
                    "role": "assistant",
                    "content": assistant_message.content,
                    "tool_calls": assistant_message.tool_calls,
                }
            )

            for tool_call in assistant_message.tool_calls:
                tool_name = tool_call.function.name
                used_tools.append(tool_name)
                try:
                    arguments = json.loads(tool_call.function.arguments or "{}")
                except json.JSONDecodeError:
                    logger.error("Failed to decode tool arguments", exc_info=True)
                    arguments = {}

                tool_result = self.tool_registry.execute(tool_name, arguments)
                conversation.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": json.dumps(tool_result),
                    }
                )

            final = self._client.chat.completions.create(
                model=self.settings.groq_model,
                messages=conversation,
                temperature=self.settings.temperature,
                max_tokens=self.settings.max_output_tokens,
            )
            final_message = final.choices[0].message.content or ""
        else:
            final_message = assistant_message.content or ""

        final_message = final_message.strip()
        self.session_store.append(session_id, "user", message)
        self.session_store.append(session_id, "assistant", final_message)

        return ChatResult(message=final_message, used_tools=used_tools)

# src/prompts/__init__.py
# src/prompts/__init__.py
"""
Exports the primary prompt templates used by Aura's AI agents.
This provides a central point of access for all core system prompts.
"""
from .coder import CODER_PROMPT, CODER_PROMPT_STREAMING
from .creative import (
    ARCHITECT_PROMPT, SEQUENCER_PROMPT, AURA_REPLANNER_PROMPT, AURA_MISSION_SUMMARY_PROMPT, CREATIVE_ASSISTANT_PROMPT
)
from .master_rules import (
    JSON_OUTPUT_RULE, RAW_CODE_OUTPUT_RULE, DOCSTRING_RULE, TYPE_HINTING_RULE,
    SENIOR_ARCHITECT_HEURISTIC_RULE, CLEAN_CODE_RULE
)

__all__ = [
    'CODER_PROMPT',
    'CODER_PROMPT_STREAMING',
    'ARCHITECT_PROMPT',
    'SEQUENCER_PROMPT',
    'AURA_REPLANNER_PROMPT',
    'AURA_MISSION_SUMMARY_PROMPT',
    'CREATIVE_ASSISTANT_PROMPT',
    'JSON_OUTPUT_RULE',
    'RAW_CODE_OUTPUT_RULE',
    'DOCSTRING_RULE',
    'TYPE_HINTING_RULE',
    'SENIOR_ARCHITECT_HEURISTIC_RULE',
    'CLEAN_CODE_RULE',
]
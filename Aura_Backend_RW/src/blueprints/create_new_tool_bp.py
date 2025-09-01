# blueprints/create_new_tool_bp.py
from src.foundry.blueprints import Blueprint

params = {
    "type": "object",
    "properties": {
        "tool_name": {
            "type": "string",
            "description": "A short, snake_case name for the new tool (e.g., 'send_email'). This will be the function name."
        },
        "description": {
            "type": "string",
            "description": "A clear, user-facing description of what the tool does."
        },
        "tool_parameters": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "type": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": ["name", "type", "description"]
            },
            "description": "A list of parameter objects for the new tool."
        },
        "action_code": {
            "type": "string",
            "description": "The complete, self-contained Python code for the action function, including all necessary imports."
        }
    },
    "required": ["tool_name", "description", "tool_parameters", "action_code"]
}

blueprint = Blueprint(
    id="create_new_tool",
    description="A 'genesis' tool that creates a new, fully functional tool for Aura to use. It generates both the blueprint and the action files required for the new tool.",
    parameters=params,
    action_function_name="create_new_tool"
)

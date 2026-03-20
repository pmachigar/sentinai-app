import os
import requests
from langchain.tools import tool
from pydantic import BaseModel, Field

CORE_API_URL = os.getenv("CORE_API_URL", "http://localhost:3000")
SYSTEM_TOKEN = os.getenv("INTERNAL_SYSTEM_TOKEN", "super-secret-system-token")

# --- GUARDRAILS ESTRICTOS MEDIANTE PYDANTIC ---

class EngineControlInput(BaseModel):
    device_id: str = Field(..., description="ID exacto del dispositivo IoT a administrar.")
    action: str = Field(..., description="Acción física y crítica a ejecutar. SÓLO puede ser 'turn_off' o 'turn_on'.", pattern="^(turn_off|turn_on)$")
    reason: str = Field(..., description="Justificación detallada del Táctico para ejecutar la acción de seguridad.")

@tool("control_engine_tool", args_schema=EngineControlInput)
def control_engine_tool(device_id: str, action: str, reason: str) -> str:
    """Útil ÚNICAMENTE para enviar un comando crítico físico al hardware vía Core API, como detener un motor remoto para prevenir un robo."""
    
    # Validation Guardrail Extra Coded
    if action not in ["turn_off", "turn_on"]:
        return "Error Crítico: Acción Inválida solicitada por el Agente. Bloqueado por Seguridad."
    
    print(f"[GUARDRAIL PASSED] Ejecutando '{action}' sobre la unidad {device_id}. Razonamiento Táctico: {reason}")
    
    # Enviar comando asíncrono hacia Core API para que este viaje por Event Bus a EMQX  
    headers = {"Authorization": f"Bearer {SYSTEM_TOKEN}"}
    try:
        # Simulación hacia la Core API ya modelada
        response = requests.post(
            f"{CORE_API_URL}/api/v1/devices/{device_id}/command",
            json={"action": action, "reason": reason},
            headers=headers
        )
        if response.status_code in [200, 201]:
            return f"Orden '{action}' emitida y encolada con éxito para la unidad {device_id}."
        return f"Core API rechazó el comando táctico: {response.text}"
    except Exception as e:
        return f"Excepción de Red al contactar Core API: {str(e)}"

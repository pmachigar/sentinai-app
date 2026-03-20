from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from agents import run_cognitive_operation

app = FastAPI(title="SentinAI - Multi-Agent Cognitive Microservice")

class InteractionRequest(BaseModel):
    user_id: str
    fleet_id: str
    query: str

@app.post("/api/v1/interact")
async def interact_with_agents(request: InteractionRequest):
    try:
        # Aquí orquestamos el pipeline de los agentes (CrewAI)
        result = run_cognitive_operation(request.query, request.fleet_id)
        return {"status": "success", "response": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

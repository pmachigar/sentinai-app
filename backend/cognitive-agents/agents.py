from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI
from tools import control_engine_tool
from vectorstore import retrieve_context
import os

# Modelo Fundacional
llm = ChatOpenAI(model="gpt-4-turbo-preview")

# --- AGENTES ---

# 1. El Analista Predictivo (Analyst)
analyst_agent = Agent(
    role="Senior Data Analyst",
    goal="Analizar telemetrías y comportamientos históricos basándose en Retrieval-Augmented Generation.",
    backstory="Eres experto buscando anomalías (robo iterativo de gasolina, frenadas bruscas asociadas a hijackers) en flotas. Destilas ruido para extraer verdades.",
    verbose=True,
    allow_delegation=True,
    llm=llm
)

# 2. El Táctico Operacional (Tactician)
tactician_agent = Agent(
    role="Operador Táctico de Ciberseguridad",
    goal="Auditar análisis y, de ser críticamente necesario, actuar apagando motores o bloqueando puertas.",
    backstory="Eres un militar riguroso con los protocolos SentinAI. Proteges vidas y activos de la flota. Usas Function Calling (Tools) SOLAMENTE cuando hay certidumbre real, pasando los Guardrails de seguridad estricta.",
    verbose=True,
    allow_delegation=False,
    tools=[control_engine_tool], 
    llm=llm
)

# 3. El Copiloto UI (Copilot)
copilot_agent = Agent(
    role="Customer Copilot",
    goal="Sintetizar la resolución hacia el usuario y acompañarlo.",
    backstory="Eres la IA amigable en el salpicadero de la app (Frontend Mobile). Siempre das partes resolutivos y evitas jerga técnica excesiva.",
    verbose=True,
    allow_delegation=False,
    llm=llm
)

def run_cognitive_operation(query: str, fleet_id: str):
    # Retrieve RAG Context multi-tenant
    rag_context = retrieve_context(query, fleet_id)
    
    task_analysis = Task(
        description=f"El usuario reporta/consulta: '{query}'. Usa este contexto de la Base RAG sobre la flota: {rag_context}. Identifica eventos atípicos.",
        expected_output="Análisis técnico situacional sobre el vehículo o flota.",
        agent=analyst_agent
    )
    
    task_tactical = Task(
        description="Si el Análisis descubre emergencias (como una solicitud de paro inminente), usa Tools para enviar comandos físicos de interrupción remota. En caso contrario, expide un informe pasivo.",
        expected_output="Registro del comando guardrail enviado o un OK condicional.",
        agent=tactician_agent
    )
    
    task_copilot = Task(
        description="Resume en primera persona al usuario lo sucedido. Si se apagó un motor, indica empatía e instrucciones claras.",
        expected_output="Respuesta final en español lista para WebSocket o Push Notification.",
        agent=copilot_agent
    )
    
    crew = Crew(
        agents=[analyst_agent, tactician_agent, copilot_agent],
        tasks=[task_analysis, task_tactical, task_copilot],
        process=Process.sequential
    )
    
    return crew.kickoff()

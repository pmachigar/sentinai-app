import os
from langchain_postgres import PGVector
from langchain_openai import OpenAIEmbeddings

# Conexión a PgVector dictada por Architecture Rules
CONNECTION_STRING = os.getenv(
    "DATABASE_URL", 
    "postgresql+psycopg://sentinai_user:sentinai_password@localhost:5432/sentinai_core"
)

embeddings = OpenAIEmbeddings()

def get_vectorstore():
    # Inicializamos almacén híbrido para telemetrías/tácticas previas (RAG)
    return PGVector(
        embeddings=embeddings,
        collection_name="sentinai_knowledge_base",
        connection=CONNECTION_STRING,
        use_jsonb=True,
    )

def retrieve_context(query: str, fleet_id: str) -> str:
    store = get_vectorstore()
    # Guardrail Natural: Filtramos por fleet_id para asegurar multitenancy estricto (Aislamiento)
    docs = store.similarity_search(query, k=3, filter={"fleet_id": fleet_id})
    return "\n".join([d.page_content for d in docs])

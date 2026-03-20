# SentinAI - Architecture Rules

Como Arquitecto Principal, establezco las siguientes reglas arquitectónicas fundamentales para la plataforma **SentinAI**. Estas directrices deben respetarse en todo el ciclo de desarrollo para garantizar escalabilidad, mantenibilidad y resiliencia.

## 1. Arquitectura Orientada a Eventos (Event-Driven Architecture)
- **Desacoplamiento:** Los servicios y componentes no se llaman entre sí de manera síncrona siempre que sea posible. Deben comunicarse emitiendo y reaccionando a eventos asíncronos.
- **Flujo de datos:** El flujo principal de datos y comandos se orquesta mediante brokers de mensajes (ej., Kafka para alta concurrencia y Event Sourcing, y EMQX para telemetría e IoT).
- **Consistencia Eventual:** Se favorece la consistencia eventual y las sagas orquestadas/coreografiadas por sobre las transacciones distribuidas bloqueantes (2PC).

## 2. Microservicios (Microservices)
- **Dominio y Contextos Delimitados (Bounded Contexts):** Cada microservicio modela una parte específica y cohesiva del dominio principal del negocio.
- **Despliegue Independiente:** Los microservicios deben poder construirse, testearse, desplegarse e integrarse en pipelines de CI/CD de manera autónoma.
- **Soberanía de Datos:** Cada servicio posee su propia base de datos (Database-per-Service pattern). Se prohíbe terminantemente que un servicio consulte la base de datos de otro directamente. Las interacciones de estado deben ser a través de las APIs (API Gateway/Service Mesh) o vía eventos.

## 3. CQRS (Command Query Responsibility Segregation)
- **Separación Lógica (y Física cuando se requiera):** Separar explícitamente los modelos de datos y las interfaces responsables de modificar el estado (Commands) de aquellos dedicados a consultar información (Queries).
- **Escalabilidad:** Permitir que los recursos para lectura (vistas materializadas, réplicas, índices optimizados por motor) escalen de manera independiente de los recursos dedicados a las escrituras.
- **Integración con Eventos:** Las escrituras (Comandos) típicamente generan eventos de dominio que la parte de lectura (Queries) consume para actualizar sus vistas materializadas asíncronamente.

## 4. Tipado Estricto (Strict Typing)
- **Contratos Fuertes (Strong Contracts):** Intercambio de mensajes mediante contratos estrictamente tipados (ej., OpenAPI schemas, GraphQL, gRPC/Protobuf, o AsyncAPI).
- **Código Fuente:** Todos los lenguajes de programación deben aplicarse con su nivel más alto de "strict typing". TypeScript se utilizará siempre en modo estricto (`"strict": true`). Otros lenguajes back-end deben validar fuertemente los límites de los dominios, garantizando robustez en tiempo de compilación frente a comportamientos de error dinámicos.

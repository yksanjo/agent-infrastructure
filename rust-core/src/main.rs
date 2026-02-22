//! Agent Server - High-performance API server

use agent_core::{AgentRequest, AgentResponse, OpenAIProvider, ReActAgent, MemoryVectorStore};
use std::convert::Infallible;
use std::sync::Arc;
use warp::Filter;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Create agent
    let provider = Box::new(OpenAIProvider::new(std::env::var("OPENAI_API_KEY").unwrap_or_default()));
    let vector_store = Box::new(MemoryVectorStore::new());
    let agent = Arc::new(ReActAgent::new(provider, vector_store));

    // Routes
    let health = warp::path!("health")
        .map(|| warp::reply::json(&serde_json::json!({"status": "healthy"})));

    let agent_route = warp::path!("api" / "agent")
        .and(warp::post())
        .and(warp::body::json())
        .and_then(move |req: AgentRequest| {
            let agent = agent.clone();
            async move {
                let response = agent.execute(req.task).await;
                match response {
                    Ok(resp) => Ok(warp::reply::json(&resp)),
                    Err(e) => Err(warp::reject::custom(e)),
                }
            }
        });

    let routes = health.or(agent_route);

    println!("🚀 Rust Agent Server starting on port 3030");
    warp::serve(routes).run(([0, 0, 0, 0], 3030)).await;
}

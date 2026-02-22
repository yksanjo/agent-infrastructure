"""
Python AI Agent - Production Implementation
LangChain + LangGraph based agent with ReAct pattern
"""

import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

# LangChain imports
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.tools import tool
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub


class AgentModel(str, Enum):
    """Supported LLM models"""
    GPT4 = "gpt-4"
    GPT4_TURBO = "gpt-4-turbo"
    GPT35_TURBO = "gpt-3.5-turbo"
    CLAUDE_3_OPUS = "claude-3-opus-20240229"
    CLAUDE_3_SONNET = "claude-3-sonnet-20240229"
    CLAUDE_3_HAIKU = "claude-3-haiku-20240307"


@dataclass
class AgentConfig:
    """Agent configuration"""
    model: AgentModel = AgentModel.GPT4_TURBO
    temperature: float = 0.7
    max_tokens: int = 4096
    provider: str = "openai"  # "openai" or "anthropic"


class PythonAgent:
    """Production Python agent using LangChain/LangGraph"""
    
    def __init__(self, config: Optional[AgentConfig] = None):
        self.config = config or AgentConfig()
        self.llm = self._create_llm()
        self.tools = []
        self._register_default_tools()
    
    def _create_llm(self):
        """Create LLM instance based on provider"""
        if self.config.provider == "anthropic":
            return ChatAnthropic(
                model=self.config.model.value,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                anthropic_api_key=os.getenv("ANTHROPIC_API_KEY")
            )
        else:
            return ChatOpenAI(
                model=self.config.model.value,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
                openai_api_key=os.getenv("OPENAI_API_KEY")
            )
    
    def _register_default_tools(self):
        """Register default tools"""
        self.tools = [
            self._search_tool(),
            self._calculator_tool(),
            self._weather_tool(),
        ]
    
    @staticmethod
    @tool
    def search(query: str) -> str:
        """Search the web for information"""
        return f"Search results for: {query}"
    
    @staticmethod
    @tool
    def calculate(expression: str) -> str:
        """Calculate mathematical expressions"""
        try:
            result = eval(expression, {"__builtins__": {}}, {})
            return str(result)
        except Exception as e:
            return f"Error: {str(e)}"
    
    @staticmethod
    @tool
    def get_weather(location: str) -> str:
        """Get weather for a location"""
        return f"Weather in {location}: Sunny, 72°F"
    
    def _search_tool(self):
        return self.search
    
    def _calculator_tool(self):
        return self.calculate
    
    def _weather_tool(self):
        return self.get_weather
    
    def add_tool(self, func):
        """Add custom tool"""
        self.tools.append(func)
    
    async def run(self, task: str) -> str:
        """Run agent with task"""
        # Using ReAct agent
        prompt = hub.pull("hwchase17/react")
        agent = create_react_agent(self.llm, self.tools, prompt)
        executor = AgentExecutor(agent=agent, tools=self.tools, verbose=True)
        
        result = await executor.ainvoke({"input": task})
        return result["output"]
    
    def run_sync(self, task: str) -> str:
        """Run agent synchronously"""
        prompt = hub.pull("hwchase17/react")
        agent = create_react_agent(self.llm, self.tools, prompt)
        executor = AgentExecutor(agent=agent, tools=self.tools, verbose=False)
        
        result = executor.invoke({"input": task})
        return result["output"]


class ReActAgent(PythonAgent):
    """ReAct (Reasoning + Acting) agent"""
    
    def __init__(self, config: Optional[AgentConfig] = None):
        super().__init__(config)
    
    async def think(self, task: str) -> Dict[str, Any]:
        """Think through task step by step"""
        thoughts = []
        
        # Initial reasoning
        thought = f"Analyzing: {task}"
        thoughts.append({"type": "thought", "content": thought})
        
        # Action
        action = {"name": "search", "input": task}
        thoughts.append({"type": "action", "content": str(action)})
        
        # Observation
        observation = {"result": f"Found info about {task}"}
        thoughts.append({"type": "observation", "content": str(observation)})
        
        return {
            "thoughts": thoughts,
            "final_answer": observation["result"]
        }


class PlanExecuteAgent(PythonAgent):
    """Plan and Execute agent"""
    
    def __init__(self, config: Optional[AgentConfig] = None):
        super().__init__(config)
    
    def plan(self, task: str) -> List[Dict[str, Any]]:
        """Create execution plan"""
        return [
            {"step": 1, "action": "research", "description": f"Research: {task}"},
            {"step": 2, "action": "analyze", "description": "Analyze findings"},
            {"step": 3, "action": "synthesize", "description": "Synthesize results"},
        ]
    
    async def execute(self, plan: List[Dict]) -> Dict[str, Any]:
        """Execute plan"""
        results = []
        
        for step in plan:
            result = await self.run(step["description"])
            results.append({"step": step["step"], "result": result})
        
        return {
            "plan": plan,
            "results": results,
            "summary": f"Completed {len(results)} steps"
        }


if __name__ == "__main__":
    import asyncio
    
    async def main():
        # Create agent
        agent = PythonAgent(AgentConfig(model=AgentModel.GPT4_TURBO))
        
        # Run task
        result = await agent.run("What is machine learning?")
        print(f"Result: {result}")
    
    asyncio.run(main())

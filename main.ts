import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { ChatOpenAI } from "https://esm.sh/langchain@0.0.105/chat_models/openai";
import { LLMChain } from "https://esm.sh/langchain@0.0.105/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from "https://esm.sh/langchain@0.0.105/prompts";
import {
    AgentExecutor,
    ZeroShotAgent,
} from "https://esm.sh/langchain@0.0.105/agents";
import { hassTools } from "./hassTool.ts";

const userRequest = Deno.args[0];

const prompt = ZeroShotAgent.createPrompt(hassTools, {
    prefix: await Deno.readTextFile("./prompts/agentPrefix.txt"),
    suffix: await Deno.readTextFile("./prompts/agentSuffix.txt"),
});
const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    new SystemMessagePromptTemplate(prompt),
    HumanMessagePromptTemplate.fromTemplate(`User request is: {input}

    This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
    {agent_scratchpad}`),
]);
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.9,
});
const stateLLM = new LLMChain({
    prompt: chatPrompt,
    llm: model,
});
// const fixParser = OutputFixingParser.fromLLM(
//     model,
//     ZeroShotAgent.getDefaultOutputParser(),
// );

const agent = new ZeroShotAgent({
    llmChain: stateLLM,
    allowedTools: hassTools.map((t) => t.name),
});

const executor = AgentExecutor.fromAgentAndTools({
    agent: agent,
    tools: hassTools,
    verbose: true,
    // callbacks: [
    //     {
    //         handleChainError: async (error) => {
    //             console.log("error", error);
    //             const fixed = await fixParser.parse(error);
    //             console.log("fixed", fixed);
    //         },
    //     },
    // ],
});
const reponse = await executor.run(userRequest);
console.log(reponse);

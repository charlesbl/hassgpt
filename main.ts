import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { initializeAgentExecutorWithOptions } from "https://esm.sh/langchain@0.0.110/agents";
import { ChatOpenAI } from "https://esm.sh/langchain@0.0.110/chat_models/openai";
import { hassTools } from "./hassTool.ts";
import { Calculator } from "https://esm.sh/langchain@0.0.110/tools/calculator";

const userRequest = Deno.args[0];
const tools = [
    new Calculator(),
    ...hassTools,
];

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo-0613",
    temperature: 0.9,
});const executor = await initializeAgentExecutorWithOptions(tools, model, {
    agentType: "openai-functions",
    returnIntermediateSteps: true,
    verbose: true,
});
const reponse = await executor.call({ input: userRequest })
console.log(reponse.output);

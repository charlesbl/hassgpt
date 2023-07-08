import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { ChatOpenAI } from "https://esm.sh/langchain@0.0.104/chat_models/openai";
import { LLMChain } from "https://esm.sh/langchain@0.0.104/chains";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from "https://esm.sh/langchain@0.0.104/prompts";
import { AgentExecutor, ZeroShotAgent } from "https://esm.sh/langchain@0.0.104/agents";
import { hassTools } from "./hassTool.ts";

const userRequest = Deno.args[0];

const prompt = ZeroShotAgent.createPrompt(hassTools, {
    prefix: await Deno.readTextFile("./prompts/agentPrefix.txt"),
    suffix: await Deno.readTextFile("./prompts/agentSuffix.txt"),
  });
const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    new SystemMessagePromptTemplate(prompt),
    HumanMessagePromptTemplate.fromTemplate(`{input}

    This was your previous work (but I haven't seen any of it! I only see what you return as final answer):
    {agent_scratchpad}`),
]);
const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
});
const stateLLM = new LLMChain({
    prompt: chatPrompt,
    llm: model,
})
const agent = new ZeroShotAgent({
    llmChain: stateLLM,
    allowedTools: hassTools.map((t) => t.name),
});

const executor = AgentExecutor.fromAgentAndTools({
    agent: agent,
    tools: hassTools,
    verbose: true,
});
const reponse = await executor.run(userRequest)
console.log(reponse)

// const stateReponse = await new LLMChain({
//     prompt: statePrompt,
//     llm: model,
// }).call({
//     entityStates: hass.exportEntityStates(),
//     input: userRequest,
//     parser: stateParser.getFormatInstructions(),
// });
// const action = await stateParser.parse(stateReponse.text);
// console.log(userRequest)
// console.log(action);
// console.log(action.message);

// if (action.isAction === "true") {
//     console.log("action requise");

//     const doActionParser = StructuredOutputParser.fromNamesAndDescriptions({
//             id: "id de l'objet connecté à utiliser",
//             action: "action à effectuer sur l'objet",
//         } );
//     const doActionPrompt = ChatPromptTemplate.fromPromptMessages([
//         SystemMessagePromptTemplate.fromTemplate(
//             await Deno.readTextFile("./prompts/do_action.txt"),
//         ),
//     ]);
//     const doActionReponse = await new LLMChain({
//         prompt: doActionPrompt,
//         llm: model,
//     }).call({
//         actions: hass.exportEntityActions(),
//         userRequest: userRequest,
//         assistantResponse: action.message,
//         parser: doActionParser.getFormatInstructions(),
//     });
//     const doAction = await doActionParser.parse(doActionReponse.text);
//     console.log(doAction);
//     const entity = hass.entities.find((e) => e.id === doAction.id);
//     if (entity === undefined) throw new Error(`entity ${doAction.id} not found`);
//     const entityAction = entity.actions.find((a) => a.id === doAction.action);
//     if (entityAction === undefined) {
//         throw new Error(`action ${doAction.action} not found`);
//     }
//     entityAction.execution();
// } else {
//     console.log("pas d'action requise");
// }

import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { Hass } from "./hass.ts";
import { ChatOpenAI } from "https://esm.sh/langchain@0.0.104/chat_models/openai";
import { LLMChain } from "https://esm.sh/langchain@0.0.104/chains";
import {
    StructuredOutputParser,
} from "https://esm.sh/langchain@0.0.104/output_parsers";
import {
    ChatPromptTemplate,
    HumanMessagePromptTemplate,
    SystemMessagePromptTemplate,
} from "https://esm.sh/langchain@0.0.104/prompts";

const hass = new Hass();
await hass.updateEntities();
const userRequest = Deno.args[0];

const chat = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
});

const stateParser = StructuredOutputParser.fromNamesAndDescriptions({
    isAction: `Est-ce que tu as effectuer ou va effectuer une une action ? (true/false)`,
    entity: `Quel objet veux-tu utiliser ?`,
    state: `Quel état veux-tu pour l'objet {entity} ?`,
    message: `Quel est le message à envoyer au client ?`,
});
const statePrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
        await Deno.readTextFile("./prompts/states.txt"),
    ),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
]);
const stateReponse = await new LLMChain({
    prompt: statePrompt,
    llm: chat,
}).call({
    entityStates: hass.exportEntityStates(),
    input: userRequest,
    parser: stateParser.getFormatInstructions(),
});
const action = await stateParser.parse(stateReponse.text);
console.log(userRequest)
console.log(action);
console.log(action.message);

if (action.isAction === "true") {
    console.log("action requise");

    const doActionParser = StructuredOutputParser.fromNamesAndDescriptions({
            id: "id de l'objet connecté à utiliser",
            action: "action à effectuer sur l'objet",
        } );
    const doActionPrompt = ChatPromptTemplate.fromPromptMessages([
        SystemMessagePromptTemplate.fromTemplate(
            await Deno.readTextFile("./prompts/do_action.txt"),
        ),
    ]);
    const doActionReponse = await new LLMChain({
        prompt: doActionPrompt,
        llm: chat,
    }).call({
        actions: hass.exportEntityActions(),
        userRequest: userRequest,
        assistantResponse: action.message,
        parser: doActionParser.getFormatInstructions(),
    });
    const doAction = await doActionParser.parse(doActionReponse.text);
    console.log(doAction);
    const entity = hass.entities.find((e) => e.id === doAction.id);
    if (entity === undefined) throw new Error(`entity ${doAction.id} not found`);
    const entityAction = entity.actions.find((a) => a.id === doAction.action);
    if (entityAction === undefined) {
        throw new Error(`action ${doAction.action} not found`);
    }
    entityAction.execution();
} else {
    console.log("pas d'action requise");
}

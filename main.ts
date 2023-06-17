import "https://deno.land/std@0.192.0/dotenv/load.ts";
import { Hass } from "./hass.ts";
import { chat, Message } from "./openai.ts";

const hass = new Hass();
await hass.updateEntities();

const input = prompt("Demande:");
if (input === null) throw new Error("input null");
let statePrompt = await Deno.readTextFile("./prompts/states.txt");
statePrompt = statePrompt.replaceAll(
    "{JSON_STATES}",
    hass.exportEntityStates(),
);
statePrompt = statePrompt.replaceAll(
    "{USER_QUERY}",
    input,
);
console.log(statePrompt);

const conversation: Message[] = [
    {
        role: "user",
        content: statePrompt,
    },
];
let response = await chat(conversation);
console.log(response);
conversation.push({
    role: "assistant",
    content: response,
});

// TODO déterminer si garder le is_action est utile pour trouver l'action
const isActionPrompt = await Deno.readTextFile("./prompts/is_action.txt");
conversation.push({
    role: "user",
    content: isActionPrompt,
});
response = await chat(conversation);
response = response.toLocaleLowerCase().replaceAll(".", "");
if (response.includes("oui") && !response.includes("non")) {
    console.log("action requise");
    conversation.push({
        role: "assistant",
        content: response,
    });

    let doActionPrompt = await Deno.readTextFile("./prompts/do_action.txt");
    doActionPrompt = doActionPrompt.replaceAll(
        "{ACTIONS}",
        hass.exportEntityActions(),
    );
    conversation.push({
        role: "user",
        content: doActionPrompt,
    });
    response = await chat(conversation);
    const json = JSON.parse(response);
    const entity = hass.entities.find((e) => e.id === json.id);
    if (entity === undefined) throw new Error(`entity ${json.id} not found`);
    const action = entity.actions.find((a) => a.id === json.action);
    if (action === undefined) {
        throw new Error(`action ${json.action} not found`);
    }
    action.execution();
} else if (!response.includes("oui") && response.includes("non")) {
    console.log("pas d'action requise");
} else {
    throw new Error(`is_action response incorrect: \n${response}`);
}

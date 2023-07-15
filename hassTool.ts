// deno-lint-ignore-file require-await
import {
    DynamicTool,
} from "https://esm.sh/langchain@0.0.110/tools";
import { Hass } from "./hass.ts";

const hass = new Hass();

const hassTools = [
    new DynamicTool({
        name: "hass-get-entities",
        description: "Retrieve the list of connected objects in your house with name and id. No input needed",
        func: async () => JSON.stringify(await hass.getEntitiesList(), null, 2),
    }),
    new DynamicTool({
        name: "hass-get-state",
        description:
            "Retrieve the state of a connected object in your house. input is a string of the id of the object you want to retrieve",
        func: async (entityId: string) => {
            const state = await hass.getEntityStates(entityId);
            if(typeof state === "string") return state;
            return state.state;
        },
    }),
    new DynamicTool({
        name: "hass-get-actions",
        description:
            "Retrieve the actions of a connected object in your house. input is a string of the id of the object you want to retrieve",
        func: async (entityId) =>
            JSON.stringify(hass.getEntityById(entityId)?.actions, null, 2),
    }),
    new DynamicTool({
        name: "hass-execute-action",
        description:
            "Execute an action of a connected object in your house. input is a json object with the entityId and actionId of the action you want to execute",
        func: async (input) => {
            try {
                JSON.parse(input);
            } catch (e) {
                return "Canceled: input must be a json object";
            }
            const { entityId, actionId } = JSON.parse(input);
            if(typeof entityId !== "string") return "action annulé: entityId doit être un string";
            if(typeof actionId !== "string") return "action annulé: actionId doit être un string";
            return await hass.executeEntityAction(entityId, actionId);
        },
    }),
];

export { hassTools };

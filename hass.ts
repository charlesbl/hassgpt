import { Entity, WatchedEntity, watchedEntities } from "./entities.ts";

const HASS_API_KEY = Deno.env.get("HASS_API_KEY")!;
const HASS_URL = Deno.env.get("HASS_URL")!;

export class Hass {
    isWatchedEntity = (entityId: string) => {
        return watchedEntities.find((we) => we.id === entityId) !== undefined;
    };

    getEntityStates = async (entityId: string) => {
        if (!this.isWatchedEntity(entityId)) return "This object doesn't exist";
        const statesReponse = await fetch(
            `https://${HASS_URL}/api/states/${entityId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + HASS_API_KEY,
                },
            },
        );
        if (statesReponse.status !== 200) return "An error occured";
        return await statesReponse.json();
    };

    getEntitiesList = () => {
        return Promise.all(watchedEntities.map(async (entity) => {
            const state = await this.getEntityStates(entity.id);
            return {
                id: entity.id,
                name: state.attributes.friendly_name,
            };
        }));
    };

    getEntityById = (entityId: string) => {
        return watchedEntities.find((e) => e.id === entityId);
    };

    getEntityActions = (entityId: string) => {
        const entity = this.getEntityById(entityId);
        if (entity === undefined) {
            return "This object doesn't exist";
        }
        if (entity.actions.length === 0) {
            return "No actions available for this object";
        }
        return entity.actions;
    };

    executeEntityAction = (entityId: string, actionId: string) => {
        const entity = this.getEntityById(entityId);
        if (entity === undefined) {
            return "This object doesn't exist";
        }
        const action = entity.actions.find((a) => a.id === actionId);
        if (action === undefined) {
           return `action ${actionId} not found`;
        }
        return action.execution(this);
    };

    changeLightState = async (
        entityId: string,
        action: "turn_on" | "turn_off",
    ) => {
        const entity = this.getEntityById(entityId);
        if (entity === undefined) {
            return "This object doesn't exist";
        }

        const setStateResponse = await fetch(
            `https://${HASS_URL}/api/services/light/${action}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + HASS_API_KEY,
                },
                body: JSON.stringify({
                    entity_id: entity.id,
                }),
            },
        );
        if (setStateResponse.status === 200) {
            return `Here is the list of entities that changed state: ${
                JSON.stringify(await setStateResponse.json())
            }`;
        } else return "An error occured";
    };
}

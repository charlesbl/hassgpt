import { Entity, watchedEntities } from "./entities.ts";

const HASS_API_KEY = Deno.env.get("HASS_API_KEY")!;
const HASS_URL = Deno.env.get("HASS_URL")!;

interface State {
    entity_id: string;
    state: string;
    attributes: {
        friendly_name: string;
    };
}

export class Hass {
    entities: Entity[] = [];

    updateEntities = async () => {
        const states = await this.getStates();
        if (this.entities.length === 0) {
            this.entities = states.map((state) => {
                const watchedEntity = watchedEntities.find((we) =>
                    we.id === state.entity_id
                );
                if (watchedEntity === undefined) return undefined;
                return new Entity(
                    state.entity_id,
                    state.attributes.friendly_name,
                    state.state,
                    watchedEntity.actions,
                );
            }).filter((e) => e !== undefined) as Entity[];
        }
    };

    getStates = async (): Promise<State[]> => {
        const statesReponse = await fetch(
            `https://${HASS_URL}/api/states`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + HASS_API_KEY,
                },
            },
        );
        return await statesReponse.json();
    };

    exportEntityStates = () => {
        return JSON.stringify(
            this.entities.map((entity) => {
                const actions = entity.actions.length === 0
                    ? "Pas d'action sur cette objet"
                    : entity.actions.map((a) => a.description);
                return {
                    id: entity.id,
                    name: entity.name,
                    state: entity.state,
                    actions,
                };
            }),
            null,
            2,
        );
    };

    exportEntityActions = () => {
        return JSON.stringify(
            this.entities.map((entity) => {
                const actions = entity.actions.length === 0
                    ? "Pas d'action sur cette objet"
                    : entity.actions;
                return {
                    id: entity.id,
                    name: entity.name,
                    actions,
                };
            }),
            null,
            2,
        );
    };
}

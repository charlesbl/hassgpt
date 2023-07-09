import { Hass } from "./hass.ts";

export class Entity {
    constructor(
        readonly id: string,
        readonly name: string,
        public state: string,
        readonly actions: Action[],
    ) {
    }
}

export interface Action {
    id: string;
    description: string;
    execution: (hass: Hass) => Promise<string>;
}

export interface WatchedEntity {
    id: string;
    actions: Action[];
}

export const watchedEntities: WatchedEntity[] = [
    {
        id: "sensor.eth_eur_ask",
        actions: [],
    },
    {
        id: "sensor.xbt_eur_ask",
        actions: [],
    },
    {
        id: "sensor.disk_use_percent",
        actions: [],
    },
    {
        id: "binary_sensor.ewelink_ds01_iaszone",
        actions: [],
    },
    {
        id: "input_number.delta_temp",
        actions: [],
    },
    {
        id: "binary_sensor.motion_sensor_occupancy",
        actions: [],
    },
    {
        id: "light.texas_instruments_cc1352_cc2652_z_stack_3_30_build_20210708_lights_zha_group_0x0002",
        actions: [
            {
                id: "turn_on",
                description: "Turn on the light",
                execution: (hass: Hass) => hass.changeLightState("light.texas_instruments_cc1352_cc2652_z_stack_3_30_build_20210708_lights_zha_group_0x0002", "turn_on"),
            },
            {
                id: "turn_off",
                description: "Turn off the light",
                execution: (hass: Hass) => hass.changeLightState("light.texas_instruments_cc1352_cc2652_z_stack_3_30_build_20210708_lights_zha_group_0x0002", "turn_off"),
            },
            {
                id: "toggle",
                description: "Toggle the light",
                execution: async () => "to toggle the light you need to use the turn_on if the light is off, and turn_off if the light is on",
            },
        ],
    },
    {
        id: "sensor.pool_temperature",
        actions: [],
    },
    {
        id: "sensor.motion_sensor_temperature",
        actions: [],
    },
];

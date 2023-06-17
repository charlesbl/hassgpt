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
    execution: () => void;
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
                id: "TURN_ON",
                description: "Allume la lumière",
                execution: () => console.log("Turn on light"),
            },
            {
                id: "TURN_OFF",
                description: "Eteins la lumière",
                execution: () => console.log("Turn off light"),
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

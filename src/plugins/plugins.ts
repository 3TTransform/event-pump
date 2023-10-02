// @ts-nocheck

interface EPDestinationPlugin {
    createTable(): boolean;
    hydrateOne(): boolean;
}

interface EPSourcePlugin {
    processEvent(): boolean;
}

export { EPDestinationPlugin, EPSourcePlugin };

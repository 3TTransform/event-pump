import { EPDestinationPlugin, EPSourcePlugin } from './../plugins';

const IonSource: EPDestinationPlugin = {
    createTable: () => {
        return true;
    },
    hydrateOne: () => {
        return true;
    },
};

const IonDesitnation: EPSourcePlugin = {
    processEvent: () => {
        return true;
    },
};

export { IonSource, IonDesitnation };

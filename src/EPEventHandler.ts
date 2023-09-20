export interface EPEventHandler {
    processOne: (
        pattern: any,
        event: any,
        isFirstEvent: boolean,
    ) => Promise<void>;
}

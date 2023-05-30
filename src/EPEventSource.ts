export interface EPEventSource
{
  readEvents: () => AsyncGenerator<any, void, unknown>;
}

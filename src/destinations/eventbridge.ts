import { EventBridge } from "aws-sdk";

const emitEvent = async (event: any) => {
  event.Detail = JSON.stringify(event.Detail);
  const eventBridge = new EventBridge();
  const params = {
    Entries: [event],
  };
  await eventBridge.putEvents(params).promise();
};

export { emitEvent };

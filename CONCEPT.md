# Concept

## Goal

Read the events from an event store, cherry pick the events we are interested in to update a data store.

## Acceptance Criteria

- 🤪 Must be open source 
- 🤪 Must be installable over the Internet via script or package manager
- 🤪 Must be a cross platform terminal application that can run locally, as well as in the pipeline
- The event store can be one of 3 things
    - 🤪 JSON Files
    - DynamoDB
    - OpenSearch
- The Event Store input should be extendable by plugins
- Memory usage must not be related to amount of input events, no amount of input events must cause a memory problem.
- Must be extremely fast, able to deal with millions of input events
- 🤪 Must be able to filter events based on similar syntax to event bridge rule definitions
- Must have at least 2 actions for each event:
    - Hydrate a service via Lambda invoke (mimic event)
    - Hydrate a service via Storage populate (bypass Lambda logic)
        - 🤪 DynamoDB
        - OpenSearch
        - Postgres
        - SQL Server
    - The Hydration of the storage should be managed by Plugins and Extendable
- 🤪 Must preserve original event ordering
- Must support dry runs
- Must be able to produce a report on the run, dry or otherwise

## Why Open Source?

There are several reasons why a for-profit SaaS (Software as a Service) company might choose to make some of its tooling open source:

0. **Paying back our debt**: Most of the software we use is open source. Toolsing, browsers, javasscrip libraries. It's time to pay back some of that by building and contributing to open source projects.
1. **Attracting developers**: Open sourcing tooling can be a way for a SaaS company to attract developers who are interested in using and contributing to the tool. This can lead to a larger and more active developer community around the tool, which can be beneficial for the company.
2. **Improving the tool**: By making the tool open source, the company can allow others to contribute to its development and improvement. This can lead to a better and more robust tool, which can be beneficial for the company and its customers.
3. **Building trust and transparency**: Open sourcing tooling can help a SaaS company build trust with its customers and the broader community. It allows others to see how the tool works and to verify that it is secure and reliable.
4. **Reducing costs**: Depending on the specific circumstances, open sourcing tooling can potentially reduce costs for the SaaS company. For example, if the company can leverage contributions from the community to develop and maintain the tool, it may not have to allocate as many resources to this effort.
5. **Promoting the company's brand**: Open sourcing tooling can also be a way for a SaaS company to promote its brand and reputation. It can demonstrate the company's commitment to open source values and help it stand out in a competitive market.

## Background

At it's core, this terminal application:

- Reads events from store
- Iterates all of the events one by one
- Filters events in real time based on rules
- Actions each event based on one of three use cases
    - Hydrate a service via Event replay
    - Hydrate a service via Lambda invoke (mimic event)
    - Hydrate a service via Storage populate (bypass event logic)
- Reports on the performed activities

---

# Reads

This may be something as simple as a JSON file with an array of events, or it make be an actual event store, such as DynamoDB

# Iterates

We will take each event and loop through them. Due to the isolated nature of each individual event, we do not need to be mindful of the previous events when iterating. this means we can fetch them individually (sub-optimal), all at once (memory hungry) or in batches (optimal)

# Filters

For each event, our specific use case my only be interested in a subset of events. For this we use a simple rules based filtering to inspect each event and only action those that match our criteria. For example, we may only be interested in `create` events for `users`. We simply do not action those that do not match this shape.

# Actions

## Via Event Replay

In this scenario we want to take the events that matter to us and filter them back into the event bridge. This is so that our microservice can pick them up. The software naturally filters rules before performing any action, Why would we do this instead of replaying the entire set of events?

- We can filter on nothing and use this as a mechanism to send all events back into the vent bus
- We can filter on events we care about to reduce the amount of events sent back into the event bus

We might allow the events replayed to invoke existing compute in our service just as they would during regular operation. This is the most natural way to hydrate a service, but it has some caveats:

- Amazon EventBridge does not guarantee ordering of events for targets. There are no services on AWS which actually guarantee this fully (other than SNS FIFO and SQS FIFO).
- We must take care to isolate the hydration events from regular system events, or we may cause duplications in other services listening for similar events


## Via Lambda Invoke

When an event is normally received from Event Bridge its common for a lambda to be the target for the event rule.

In this case, instead of sending events into event bridge, we can construct the event object ourselves and invoke the lambda directly. The Lambda would then perform its job and update the service store. The bonus is that with short delays or seial invocation between incoming events, we can (almost) guarantee ordering. It's also slightly faster since we do not have to wait on the event bridge and rule processing, saving precious time.

The downside is that we bypass the rules and invoke directly. We ahve to ensure that our fake rules send events to the correct place.

## Via Storage Populate

We can go even one step further, and if we are willing to bypass the logic in our compute layer, we can insert events directly into the data store. This suits us if:

- There is no processing of the data before storage (manipulation would commonly occur inside the compute layer we bypassed)
- The Lambda invocations associated with the data store have time consuming or unneccesary side effects we do not want to observe, like emitting more events, or calling services that have a slow response.

In AWS, there are a few obvious targets for data manipulation:

- DynamoDB
    - DynamoDB is designed to support high levels of read and write throughput, and can handle hundreds of thousands of requests per second.
    - DynamoDB automatically scales up or down to meet the needs of your application, without the need for manual intervention.
- Redshift
    - In general, Redshift is a good choice for data warehousing and business intelligence workloads, while OpenSearch is a good choice for search and analytics workloads.
    - Amazon Redshift is not a serverless service, but it does offer a fully managed service model. This means that Amazon Web Services (AWS) handles all of the underlying infrastructure and maintenance tasks for Redshift.
- RDS (SQL)
- OpenSearch
- S3 (Athena)

# Reports

We give a brief summary, optionally in a parsable format so that other tooling running after this can have an idea of what happened during event hydration.

Ideally, we want to see the failed areas, of there are any.


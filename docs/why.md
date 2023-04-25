

# Why Event Sourced Data

Event sourcing enables us to use a sequence of immutable events as a reliable source of truth, allowing for easy system reconstruction, debugging, and enhanced scalability in an event-driven architecture.

## A Sequence of Immutable Events

In event-driven architecture, an event store is a database that records all events as they occur in a system. The event store provides a durable record of all events, including their metadata and payload, in the order they were generated. This means that any event that has occurred in the system can be easily retrieved and replayed at any time.

## The Source of Truth

Event sourcing is considered a reliable source of truth because it captures the entire history of state changes in an event-driven system as a sequence of immutable events. By storing these events in an event store, the system can reconstruct its current state at any point in time by replaying the events in chronological order. This approach not only ensures data consistency, but also enables easy debugging and auditing by providing a transparent and traceable record of all changes. Furthermore, since the event store retains the complete history, it allows for temporal queries, event analysis, and even recreating past system states when needed, providing a robust foundation for a resilient and maintainable system.

Imagine not being bothered if you delete your database because you can rebuild it from the event source.

## Easy System Reconstruction

Easy system reconstruction and hydration of services refer to the process of rebuilding the state of a service or an entire system using the events stored in an event store. In an event-sourced system, the current state of a service is derived from a series of events that led to its present condition. By replaying these events in the order they occurred, the system can reconstruct the service's state at any given point in time.

Hydration is the process of initializing or updating the state of a service by consuming the relevant events from the event store. When a service starts or needs to catch up on missed events, it fetches the events from the event store, processes them in sequence, and updates its state accordingly. This enables the service to maintain an accurate and up-to-date state while ensuring consistency across the entire system.

The ability to easily reconstruct and hydrate services provides several advantages, including fault tolerance, disaster recovery, and system scalability. It allows for quick recovery from failures, as the service can be restored to its last known state by replaying the events. In addition, new instances of a service can be quickly brought up to speed by consuming events from the event store, which aids in horizontal scaling and load balancing.

## A Real World Example

Let's consider a simple real-world example of a bank account to illustrate event sourcing and hydration in practice. In this scenario, events include account creation, deposits, and withdrawals.

### Event sourcing:

- When a new account is created, an "AccountCreated" event is generated with the initial account balance.
- When a deposit is made, a "DepositMade" event is generated with the deposited amount.
- When a withdrawal is made, a "WithdrawalMade" event is generated with the withdrawn amount.

These events are stored in the event store in the order they occur. In this example, the event store acts as a ledger, recording every transaction that affects the account balance.

### Hydration:
Suppose the bank's system needs to fetch the current balance of an account. To do this, the system retrieves all events related to the account from the event store and processes them in chronological order. Here's an example of how the process might work:

- An account was created with an initial balance of £100 (AccountCreated event).
- A deposit of £50 was made (DepositMade event).
- A withdrawal of £30 was made (WithdrawalMade event).

The system processes these events sequentially:

- Starts with the initial balance of £100.
- Adds the deposit of £50, resulting in a balance of £150.
- Subtracts the withdrawal of $30, resulting in a final balance of £120.

By replaying the events, the system has reconstructed the current state of the account, hydrating it with the latest balance information.

## Added Complexity

Event sourcing, despite its numerous benefits, does have some downsides that are important to consider. One of the most significant challenges is the increased complexity that comes with implementing and managing an event-sourced system. Setting up an event store and ensuring that it's correctly configured, scalable, and fault-tolerant can be a daunting task, especially for teams that are new to the concept.

Moreover, event-sourced systems introduce an added layer of complexity when it comes to handling business logic. Developers must shift their mindset from a traditional CRUD (Create, Read, Update, Delete) approach to an event-driven one, focusing on the sequence of events that lead to a particular state. This may require additional training and support for developers, as well as a more thorough understanding of the domain model to correctly identify and handle events.

Another challenge with event sourcing is the potential performance impact. Since the state of a system or service is derived from a series of events, there might be some latency when reconstructing the state from a long event history. To mitigate this, systems often employ snapshots or caching mechanisms to optimize the reconstruction process, but these solutions can also introduce additional complexity and maintenance overhead.

Finally, dealing with schema evolution and versioning can be particularly tricky in event-sourced systems. As the system evolves, event schemas may need to change, and developers must take care to ensure that the system can handle both new and old event formats. This may involve implementing strategies for event upconversion, which can be a complex and error-prone process.

## Getting Your Organisation To This Level

To overcome the complexity associated with implementing and maintaining an event-sourced system, a team can focus on developing certain traits and skills that will help them navigate the challenges. Some of these traits include:

### Strong domain knowledge

Having a deep understanding of the business domain is crucial when designing and implementing an event-driven system. It enables the team to accurately identify the key events and their relationships, facilitating a more effective event-driven architecture.

### Effective communication and collaboration

Open communication and close collaboration among team members, as well as with stakeholders, can help in clarifying requirements, identifying potential issues, and ensuring that everyone is on the same page regarding the system's goals and architecture.

### Adaptability and willingness to learn

Embracing the event-driven mindset and adapting to new concepts and techniques is essential for successfully implementing an event-sourced system. A team that is open to learning and adopting new paradigms will be better prepared to tackle the complexities involved.

### Focus on modular and maintainable design

Designing the system in a modular and maintainable way can help reduce complexity and make it easier to manage over time. This includes following best practices for software design, such as the SOLID principles, and employing patterns like CQRS (Command Query Responsibility Segregation) to separate concerns.

### Prioritizing testing and automation

Rigorous testing and automation are vital for ensuring the reliability and robustness of an event-sourced system. By investing in automated tests, continuous integration, and deployment pipelines, the team can minimize the risk of errors and simplify maintenance.

### Documentation and knowledge sharing

Thorough documentation and effective knowledge sharing within the team can help to ensure that everyone understands the system's architecture, event schemas, and the rationale behind design decisions. This promotes a shared understanding and makes it easier to maintain and evolve the system over time.





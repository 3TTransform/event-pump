# Config File Structure

> What shape is the config YML file?

## `name`

<string> This is the name of this config. It will be displayed as a progress bar when run interactively in the console, or in the CI/CD pipeline you run this tool from.

_Example of naming the job:_
```yml
name: AWS Ion Example
```

## `source`

This defines the [source of our events](https://github.com/3TTransform/event-pump/blob/master/sources.md). We define the type hre and the location of the source, be it a file, or a table if the source is DynamoDb.

_Example for CSV:_
```yml
source:
  type: csv
  file: ./examples/events/pets.seed.csv
```
_Example for DynamoDb:_
```yml
source:
  type: dynamo
  table: table-name
```
_Example for JSON:_
```yml
source:
  type: json
  file: ./examples/events/pets.seed.json
```

## `patterns`

Patterns allow us to match each event found in the source to a rule and then perform actions against it.

_Example for [DynamoDb destination](https://github.com/3TTransform/event-pump/blob/master/destinations.md):_
```yml
patterns:
  - name: petCreate
    rule:
      noun: pets
      verb: create
    action:
      target: dynamodb
      params:
        TableName: Example
        Item:
          pk: "pets#{{id}}"
          sk: "pets"
          id: "{{id}}"
          myName: "{{name}}"
          ownerId: "{{owner}}"
```

- Each pattern has a `name`
- Each pattern needs a `rule`
- Each pattern needs an `action`.

### The `name`

The name can be any string and does not affect the data. It is used as a human reference at this time and it can be anything you desire to help you find the action in a long list.

### The `rule`

The rule is an object that specifies which event to match on, for example:

```yml
rule:
  noun: pets
  verb: create
```

This will match all events with the `noun`: 'pets' and the `verb`: 'create'. If you omit the rule then this action will run for EVERY event. You can have any number of rules.

```yml
rule:
  cake: lie
  pie: delicious
  hotdog: awesome
  spoon: available
  sugar: magical
```

This would match a very specific (delicious) event.

## `action`

This is what will be performed when a `rule` matches.

The `target` of the `action` can currently be one of:

- AWS Ion
- DynamoDb
- SQL Server

More in depth discussion on the destinations [can be found here](https://github.com/3TTransform/event-pump/blob/master/destinations.md)
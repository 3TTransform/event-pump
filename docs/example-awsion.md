## AWS Ion Example

```sh
touch example.json
```
Paste this:

```json
[  
  {
    "verb": "create",
    "noun": "permission",
    "id": "de5cd33e-2c96-44c2-ae08-25a9e842a611",
    "name": "Add"
  },
  {
    "verb": "create",
    "noun": "permission",
    "id": "de5cd33e-2c96-44c2-ae08-25a9e842a612",
    "name": "Read"
  },
  {
    "verb": "create",
    "noun": "permission",
    "id": "de5cd33e-2c96-44c2-ae08-25a9e842a606",
    "name": "Remove"
  }
]
```

```sh
touch hydrate-permissions.yml
```

Paste this:
```yml
name: AWS Ion Permissions Example
source: 
  type: json
  file: ./test.json
patterns:
  - name: ionExample
    rule:
      noun: permission
      verb: create
    action:
      target: ion
      file: ./permissons.ion        
      shape:
        pk: "attestation#{{id}}"
        sk: "attestation"
        id: "{{id}}"
        name: "{{name}}"
```

Now hydrate your Ion from your JSON:

```sh
event-pump hydrate-permissions.yml
```
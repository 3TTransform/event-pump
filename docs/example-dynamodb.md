# Getting Started with DynamoDb Locally

1. Start DynamoDB locally - `docker run -itd -p 8000:8000  --name dev-db amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -sharedDb`
2. Configure `aws-cli`, you may use _any_ secret keys or region, configure with: `aws configure`
3. Create an `Example` table with a pk and sk as the HASH and RANGE keys:

```
aws dynamodb create-table --table-name Example --attribute-definitions AttributeName=pk,AttributeType=S AttributeName=sk,AttributeType=S --key-schema AttributeName=pk,KeyType=HASH AttributeName=sk,KeyType=RANGE --billing-mode PAY_PER_REQUEST --endpoint-url http://localhost:8000
```

4. Install local DynamoDB browser:
```
npm install -g dynamodb-admin

# For Windows CMD:
set DYNAMO_ENDPOINT=http://localhost:8000
dynamodb-admin

# For Mac/Linux:
DYNAMO_ENDPOINT=http://localhost:8000 dynamodb-admin
```

5. Go to URL and view your table sans data: `http://localhost:8001/tables/Example`

6. You are now ready to run the `event-pump` tool into this new local DynamoDb instance.

## Hydrate your new DynamoDb Table

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
touch hydrate-permissions-dynamo.yml
```

Paste this:
```yml
name: DynamoDb Local Permissions Example
source: 
  type: json
  file: ./example.json
patterns:
  - name: dynamoExample
    rule:
      noun: permission
      verb: create
    action:
      target: dynamodb
      params:
        TableName: Example
        Item:
          pk: "permissions#{{id}}"
          sk: "permissions"
          id: "{{id}}"
          name: "{{name}}"
```

Now hydrate your Ion from your JSON:

> 💥 We need to specify the endpoint override for the `event-pump` tool so that it points to your local DynamoDb instead of AWS cloud. To do this type `export ENDPOINT_OVERRIDE=http://localhost:8000` in the terminal before you run the below command.

> 💥 To remove this an allow the `event-pump` tool to communicate with AWS cloud, use this command: `unset ENDPOINT_OVERRIDE`

> 💥 We must specify the `AWS_DEFAULT_REGION` in order to run data into DynamoDb. Do it like this: `export AWS_DEFAULT_REGION=eu-west-2` as an example.

```sh
event-pump hydrate-permissions-dynamo.yml
```

7. Go to URL and view your records in the local dynamoDb table: `http://localhost:8001/tables/Example`

---

# CLI Helpful Examples

## 💡 Example: Query with the CLI

```sh
aws dynamodb query \
    --endpoint-url http://localhost:8000 \
    --region eu-west-2 \
    --table-name Example \
    --key-conditions '{
        "pk":{
            "ComparisonOperator":"EQ",
            "AttributeValueList": [ {"S": "organisation#bf469ba7-4df1-4ba7-9af4-3c1f66322bba"} ]
        }
    }'
```

## 💡 Example: Add Reverse Index with the CLI

```sh
aws dynamodb update-table \
	--endpoint-url http://localhost:8000 \
    --region eu-west-2 \
    --table-name Example \
	--attribute-definitions AttributeName=sk,AttributeType=S  \
    --global-secondary-index-updates \
        "[
            {
                \"Create\": {
                    \"IndexName\": \"Reverse\",
                    \"KeySchema\": [{\"AttributeName\":\"sk\",\"KeyType\":\"HASH\"},
                                    {\"AttributeName\":\"pk\",\"KeyType\":\"RANGE\"}],
                    \"Projection\":{
                        \"ProjectionType\":\"ALL\"
                    }
                }
            }
        ]"
```
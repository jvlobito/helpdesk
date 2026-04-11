/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.role = \"supervisor\" || author_id = @request.auth.id",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3306545694",
        "hidden": false,
        "id": "relation1879066578",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "ticket_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation4134925083",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "author_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text4274335913",
        "max": 0,
        "min": 0,
        "name": "content",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "bool2656725767",
        "name": "is_internal",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "bool"
      }
    ],
    "id": "pbc_533777971",
    "indexes": [],
    "listRule": "@request.auth.role = \"supervisor\" || (@request.auth.role = \"agente\" && ticket_id.department_id = @request.auth.department_id) || (ticket_id.created_by = @request.auth.id && is_internal = false)",
    "name": "comments",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"supervisor\" || author_id = @request.auth.id",
    "viewRule": "@request.auth.role = \"supervisor\" || (@request.auth.role = \"agente\" && ticket_id.department_id = @request.auth.department_id) || (ticket_id.created_by = @request.auth.id && is_internal = false)"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_533777971");

  return app.delete(collection);
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.role = \"supervisor\" || @request.auth.role = \"agente\"",
    "deleteRule": "@request.auth.role = \"supervisor\"",
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
        "hidden": false,
        "id": "select1305942106",
        "maxSelect": 1,
        "name": "field_changed",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "status",
          "priority",
          "assigned_to"
        ]
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3152253650",
        "max": 0,
        "min": 0,
        "name": "old_value",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3856735209",
        "max": 0,
        "min": 0,
        "name": "new_value",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation280784287",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "changed_by",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "date1159742177",
        "max": "",
        "min": "",
        "name": "changed_at",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_211639438",
    "indexes": [],
    "listRule": "@request.auth.role = \"supervisor\" || (@request.auth.role = \"agente\" && ticket_id.department_id = @request.auth.department_id) || ticket_id.created_by = @request.auth.id",
    "name": "ticket_history",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"supervisor\"",
    "viewRule": "@request.auth.role = \"supervisor\" || (@request.auth.role = \"agente\" && ticket_id.department_id = @request.auth.department_id) || ticket_id.created_by = @request.auth.id"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_211639438");

  return app.delete(collection);
})

/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\" && @request.auth.role = \"cliente\" && created_by = @request.auth.id",
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
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text3973215647",
        "max": 30,
        "min": 0,
        "name": "ticket_number",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text724990059",
        "max": 200,
        "min": 0,
        "name": "title",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1843675174",
        "max": 0,
        "min": 0,
        "name": "description",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select1655102503",
        "maxSelect": 1,
        "name": "priority",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "low",
          "medium",
          "high",
          "critical"
        ]
      },
      {
        "hidden": false,
        "id": "select105650625",
        "maxSelect": 1,
        "name": "category",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "hardware",
          "software",
          "network",
          "other"
        ]
      },
      {
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 1,
        "name": "status",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "new",
          "in_progress",
          "waiting",
          "resolved",
          "reopened",
          "closed"
        ]
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3865025440",
        "hidden": false,
        "id": "relation2927687135",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "department_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation3725765462",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "created_by",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "_pb_users_auth_",
        "hidden": false,
        "id": "relation2314121105",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "assigned_to",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "date1561543039",
        "max": "",
        "min": "",
        "name": "closed_at",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_3306545694",
    "indexes": [
      "CREATE UNIQUE INDEX idx_tickets_ticket_number ON tickets (ticket_number)"
    ],
    "listRule": "@request.auth.role = \"supervisor\" || created_by = @request.auth.id || (@request.auth.role = \"agente\" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = \"\")))",
    "name": "tickets",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.role = \"supervisor\" || (@request.auth.role = \"agente\" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = \"\")))",
    "viewRule": "@request.auth.role = \"supervisor\" || created_by = @request.auth.id || (@request.auth.role = \"agente\" && (assigned_to = @request.auth.id || (department_id = @request.auth.department_id && assigned_to = \"\")))"
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694");

  return app.delete(collection);
})

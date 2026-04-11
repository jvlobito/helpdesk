/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // add field
  collection.fields.addAt(14, new Field({
    "hidden": false,
    "id": "select1358545579",
    "maxSelect": 1,
    "name": "close_reason",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "solucion_aplicada",
      "consulta_resuelta",
      "sin_respuesta_cliente",
      "duplicado",
      "otro"
    ]
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1083219381",
    "max": 0,
    "min": 0,
    "name": "close_reason_detail",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text527443699",
    "max": 0,
    "min": 0,
    "name": "resolution_note",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "hidden": false,
    "id": "select3694835104",
    "maxSelect": 1,
    "name": "reopen_reason",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "problema_persistente",
      "solucion_incompleta",
      "nuevo_impacto",
      "otro"
    ]
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1569353662",
    "max": 0,
    "min": 0,
    "name": "reopen_reason_detail",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3306545694")

  // remove field
  collection.fields.removeById("select1358545579")

  // remove field
  collection.fields.removeById("text1083219381")

  // remove field
  collection.fields.removeById("text527443699")

  // remove field
  collection.fields.removeById("select3694835104")

  // remove field
  collection.fields.removeById("text1569353662")

  return app.save(collection)
})

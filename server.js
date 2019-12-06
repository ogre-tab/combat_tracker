// Trenton Bodenner
// 12/02/2019
// CS453 - Final Project

// NOTES:
// possibly remove the refresh buttons from the initial-view and entity-view

const express = require("express");
const bodyParser = require('body-parser');
const mongodb = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

// application config constants
const HTTP_PORT = 5000;
const DB_NAME = "ct-db";
const ENCOUNTER_COLLECTION_NAME = "encounter";
const ENTITY_COLLECTION_NAME = "entity";
const MONGO_PORT = 27017;
const MONGO_SERVER = "localhost";

// create our express server
const app = express();
// create our parser for express requests
const jsonParser = bodyParser.json();

// use the public folder to store our webpages
app.use(express.static("public"));

// mongodb
const MONGO_URL = `mongodb://${MONGO_SERVER}:${MONGO_PORT}`;
console.log(MONGO_URL);
let db = null;
let encounter_collection = null;
let entity_collection = null;

// class to store an encounter
class Encounter
{
    constructor(id, name)
    {
        this._id = id;
        this.name = name;
        this.entities = [];
    }

    // add an entity id to this encounter
    addEntity(entity_id)
    {
        // add the id to the encounter array
        this.entities.push(entity_id);
    }

    // remove an entity id from this encounter
    removeEntity(entity_id)
    {
        // create an empty array
        temp_entities = [];
        // loop through our entities array
        for (let index = 0; index < this.entities.length; index++)
        {
            // get our current element from the array
            const element = this.entities[index];
            // check if this element matches our input id
            if (element !== entity_id)
            {
                // if the element does not match, then add the id to our new array
                temp_entities.push(element);
            }
        }
        // replace the entities array with the new array that does not contain the given id
        this.entities = temp_entities;
    }
}

// class to store an entity
class Entity
{
    constructor(id, name, current_hp, max_hp, ac, initiative, url)
    {
        this._id = id;
        this.name = name;
        this.current_hp = current_hp;
        this.max_hp = max_hp;
        this.ac = ac;
        this.initiative = initiative;
        this.url = url;
    }
}

// start our webserver and connect to our mongo database
async function startDbAndServer()
{
    // set database and collection before server starts
    let client = await mongodb.connect(MONGO_URL, {useUnifiedTopology: true});
    db = client.db(DB_NAME);
    // set our collection variables
    encounter_collection = db.collection(ENCOUNTER_COLLECTION_NAME);
    entity_collection = db.collection(ENTITY_COLLECTION_NAME);
    // start the http server on our designated port
    app.listen(HTTP_PORT);
    console.log(`Started combat tracker server on port ${HTTP_PORT}.\nhttp://localhost:${HTTP_PORT}`);
};
startDbAndServer();

// get a list of all saved encounters
async function onGetAllEncounters(req, res)
{
    // get all the encounters
    let encounters = await encounter_collection.find({}).toArray();
    // sort the array
    encounters.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
    // serialize the encounters
    let encounters_json = JSON.stringify(encounters);
    // return the encounters
    res.json(encounters_json);
    // write to the log
    console.log("sent all encounters to client");
}
app.get("/get/encounters", onGetAllEncounters);

// get a saved entity
async function onGetEntity(req, res)
{
    // search the collection for matching entity
    const entity = await entity_collection.findOne({ _id: ObjectId(req.params.entityId) });
    // return the found entity
    res.json(JSON.stringify(entity));
    // write to the log
    console.log(`sent entity '${req.params.entityId}' to client`);
}
app.get("/get/entity/:entityId", onGetEntity);

// create an encounter
async function onCreateEncounter(req, res)
{
    // get the encounter name from the client
    const name = req.body.name;
    // create a mongodb id
    const id = ObjectId();
    // create the encounter object
    const encounter = new Encounter(id, name);
    // save the encounter in the mongo db
    const result = await encounter_collection.insertOne(encounter);
    // send the encounter to the client
    res.json(JSON.stringify(encounter));
    // write to the log
    console.log(`created encounter '${encounter._id}' and sent to client`);
}
app.post("/create/encounter", jsonParser, onCreateEncounter);

// delete an encounter
async function onDeleteEncounter(req, res)
{
    // get the encounter name from the client
    const id = req.params.encounterId;
    // save the encounter in the mongo db
    const result = await encounter_collection.deleteOne({ _id: ObjectId(id) });
    // send the result to the client
    res.json(JSON.stringify({done: true}));
    // write to the log
    console.log(`deleted encounter '${id}' and notified client`);
}
app.delete("/delete/encounter/:encounterId", onDeleteEncounter);

// get a list of all saved entities
async function onGetAllEntities(req, res)
{
    // get all the entities
    let entities = await entity_collection.find({}).toArray();
    // sort the array
    entities.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1);
    // serialize the entities
    let entities_json = JSON.stringify(entities);
    // return the entities
    res.json(entities_json);
    // write to the log
    console.log("sent all entities to client");
}
app.get("/get/entities", onGetAllEntities);

// create an entity
async function onCreateEntity(req, res)
{
    // get the entity values from the client
    const name = req.body.name;
    const ac = req.body.ac;
    const hp = req.body.hp;
    const url = req.body.url;
    // create a mongodb id
    const id = ObjectId();
    // create the encounter object
    const entity = new Entity(id, name, hp, hp, ac, "", url);
    // save the encounter in the mongo db
    const result = await entity_collection.insertOne(entity);
    // send the encounter to the client
    res.json(JSON.stringify(entity));
    // write to the log
    console.log(`created entity '${entity._id}' and sent to client`);
}
app.post("/create/entity", jsonParser, onCreateEntity);

// add an entity to an encounter
async function onAddEntityToEncounter(req, res)
{
    // get the entity id and encounter id from the client
    const encounter_id = req.params.encounterId;
    const entity_id = req.params.entityId;
    // create our query and update value
    const query = { _id: ObjectId(encounter_id) };
    const update_value = { $push: {entities: entity_id} };
    // update the encounter in the mongo db
    const result = await encounter_collection.updateOne(query, update_value);
    // send the result to the client
    res.json(JSON.stringify({done: true}));
    // write to the log
    console.log(`added entity '${entity_id}' to encounter '${encounter_id}' and notified client`);
}
app.post("/update/encounter/:encounterId/add/entity/:entityId", onAddEntityToEncounter);

// remove an entity to an encounter
async function onRemoveEntityFromEncounter(req, res)
{
    // get the entity id and encounter id from the client
    const encounter_id = req.params.encounterId;
    const entity_id = req.params.entityId;
    // create our query and update value
    const query = { _id: ObjectId(encounter_id) };
    const update_value = { $pull: {entities: entity_id} };
    // update the encounter in the mongo db
    const result = await encounter_collection.updateOne(query, update_value);
    // send the result to the client
    res.json(JSON.stringify({done: true}));
    // write to the log
    console.log(`removed entity '${entity_id}' from encounter '${encounter_id}' and notified client`);
}
app.post("/update/encounter/:encounterId/remove/entity/:entityId", onRemoveEntityFromEncounter);

// delete an entity
async function onDeleteEntity(req, res)
{
    // get the encounter name from the client
    const id = req.params.entityId;
    // save the encounter in the mongo db
    const result = await entity_collection.deleteOne({ _id: ObjectId(id) });
    // send the result to the client
    res.json(JSON.stringify({done: true}));
    // write to the log
    console.log(`deleted entity '${id}' and notified client`);
}
app.delete("/delete/entity/:entityId", onDeleteEntity);

// update an entity
async function onUpdateEntity(req, res)
{
    // get the entity values from the client
    const id = ObjectId(req.params.entityId);
    const hp = req.params.hp;
    const init = req.params.init;
    // create a query
    const query = { _id: id }
    // create an update
    const update = { $set: { current_hp: hp, initiative: init } }
    // save the encounter in the mongo db
    const result = await entity_collection.updateOne(query, update);
    // send the result to the client
    res.json(JSON.stringify({done: true}));
    // write to the log
    console.log(`updated entity '${id}' hp (${hp}) initiative (${init}) and notified client`);
}
app.post("/update/entity/:entityId/hp/:hp/init/:init", onUpdateEntity);
// Trenton Bodenner
// 12/02/2019
// CS453 - Final Project

// NOTES:

// client needs to be able to create new encounters
// start with the ui to create an encounter and add an entity

// client sends the server the name of the encounter
// server creates the encounter object and saves the object in mongo
// the server sends the client the encounter object json

// client needs a list of encounters
// to load an encounter, the client will fetch("/getEncounterIds");
// server will send an array of encounters
// clicking the LOAD button will only get the encounters if the array is null
// clicking the REFRESH button will get the encounter array again

// to load a specific encounter
// client will then fetch each entity_id in the selected encounter
// client will fetch("/getEntityById", entity_id = [111, 222, 333]);
// server will send jason data for each entity

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

async function test_function()
{
    test1 = new Encounter(ObjectId(), "test1");
    test1e = new Entity(ObjectId(), "test", 10, 10, 10, 5, 0, "url goes here");
    test1.addEntity(test1e._id)

    console.log(JSON.stringify(test1))
    console.log(JSON.stringify(test1e))

    result1 = await encounter_collection.updateOne({_id: test1._id}, {$set: test1}, {upsert: true});
    result1e = await entity_collection.updateOne({_id: test1e._id}, {$set: test1e}, {upsert: true});
}

// start our webserver and connect to our mongo database
async function startDbAndServer()
{
    // set database and collection before server starts
    let client = await mongodb.connect(MONGO_URL, {useUnifiedTopology: true});
    db = client.db(DB_NAME);
    encounter_collection = db.collection(ENCOUNTER_COLLECTION_NAME);
    entity_collection = db.collection(ENTITY_COLLECTION_NAME);
    // start the http server on our designated port
    app.listen(HTTP_PORT);
    console.log(`Started combat tracker server on port ${HTTP_PORT}.\nhttp://localhost:${HTTP_PORT}`);
    //test_function();
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

// load a saved encounter
async function onGetEncounter(req, res)
{
    // create our id query
    const query = {_id: req.params.encounterId};
    // get the encounter by its id
    const encounter = await encounter_collection.findOne(query);
    const encounter_json = JSON.stringify(encounter);
    // return our encounter
    res.json(encounter_json);
    // write to the log
    console.log(`sent encounter '${encounter._id}' to client`);
}
app.get("/encounter/:encounterId", onGetEncounter);

// get saved entities
async function onGetEntities(req, res)
{
    // put our entity ids in an ObjectId array
    let objIds = [];
    req.body.entities.forEach(ent =>
    {
        objIds.push(ObjectId(ent));
    });
    // search the collection for any entities matching our ids
    const entities = await entity_collection.find({_id: {$in:objIds}}).toArray();
    // return all the found entities
    res.json(JSON.stringify(entities));
    // write to the log
    console.log("sent entities to client");
}
app.post("/get/entities", jsonParser, onGetEntities);

// create an encounter
async function onCreateEncounter(req, res)
{
    // get the encounter name from the client
    const name = req.body.name;
    // create a mongodb id
    const id = ObjectId();
    // create the encounter object
    const encounter = new Encounter(id, name);
    // save the encounter in the mongodb
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
    const id = req.body._id;
    // create a query
    const query = { _id: ObjectId(id) };
    // save the encounter in the mongodb
    const result = await encounter_collection.deleteOne(query).catch(err =>
    {
        // send the result to the client
        Promise.reject({deleted: false});
        // write to the log
        console.log(`failed to deleted encounter '${id}' and notified client`);
        return;
    });
    // send the result to the client
    res.json(JSON.stringify({deleted: true}));
    // write to the log
    console.log(`deleted encounter '${id}' and notified client`);
}
app.post("/delete/encounter", jsonParser, onDeleteEncounter);

// save an encounter
async function onSaveEncounter(req, res)
{
    // collection.update(upsert: true)
}
//app.post("route", jsonParser, onSaveEncounter);

// add an entity to an encounter
async function onAddEntity(req, res)
{
    // collection.update($set)
}
//app.post("route", jsonParser, onAddEntity);

// remove an entity from an encounter
async function onRemoveEntity(req, res)
{
    // collection.update($unset)
}
//app.post("route", jsonParser, onRemoveEntity);

// update an entity in an encounter
async function onUpdateEntity(req, res)
{
    // collection.update($set)
}
//app.post("route", jsonParser, onUpdateEntity);


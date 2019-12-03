// Trenton Bodenner
// 12/02/2019
// CS453 - Final Project

const express = require("express");
const app = express();
const mongodb = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

// application config constants
const HTTP_PORT = 5000;
const DB_NAME = "ct-db";
const ENCOUNTER_COLLECTION_NAME = "encounter";
const ENTITY_COLLECTION_NAME = "entity";
const MONGO_PORT = 27017;
const MONGO_SERVER = "localhost";

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
    constructor(id, name, current_hit_points, max_hit_points, armor_class, initiative_modifier, initiative, url)
    {
        this._id = id;
        this.name = name;
        this.current_hit_points = current_hit_points;
        this.max_hit_points = max_hit_points;
        this.armor_class = armor_class;
        this.initiative_modifier = initiative_modifier;
        this.initiative = initiative;
        this.url = url;
    }
}

async function test_function()
{
    test1 = new Encounter(ObjectId(), "test1");
    test1e = new Entity(ObjectId(), "test", 10, 10, 10, 5, 0, "url goes here");
    //test1.addEntity(test1e._id)

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
    test_function();
};
startDbAndServer();



// NOTES:
// client needs a list of encounters
// to load an encounter, the client will fetch("/getEncounterIds");
// server will send an array of encounters
// clicking the LOAD button will only get the encounters if the array is null
// clicking the REFRESH button will get the encounter array again

// to load a specific encounter
// client will then fetch each entity_id in the selected encounter
// client will fetch("/getEntityById", entity_id = [111, 222, 333]);
// server will send jason data for each entity


// load a saved encounter
async function onGetEncounter(req, res)
{
    // collection.findOne()
}
//app.get("route", onGetEncounter);

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


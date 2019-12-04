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
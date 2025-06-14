// Trenton Bodenner
// 12/02/2019
// CS453 - Final Project

class EncounterView
{
    constructor(containerElement, encounter)
    {
        this.containerElement = containerElement;
        this.initialView = document.querySelector("#initial-view");
        this.encounterView = document.querySelector("#encounter-view");
        this.entityView = document.querySelector("#entity-view");
        this.encounterTable = document.querySelector("#encounter-table");
        this.encounterTableBody = document.querySelector("#encounter-table-body");
        this.encounterLegend = document.querySelector("#encounter-legend");
        this.buttonAddEntity = document.querySelector("#encounter-button-add-entity");
        this.buttonChangeEncounter = document.querySelector("#encounter-button-change-encounter");
        this.buttonSort = document.querySelector("#encounter-button-sort");
        this.encounter = encounter;
        this.objEntityView = null;

        // bind methods
        this._addHp = this._addHp.bind(this);
        this._removeHp = this._removeHp.bind(this);
        this._onAddEntity = this._onAddEntity.bind(this);
        this._onChangeEncounter = this._onChangeEncounter.bind(this);
        this._createEntityRow = this._createEntityRow.bind(this);
        this._onSortEncounter = this._onSortEncounter.bind(this);
        this._onUpdateEntity = this._onUpdateEntity.bind(this);

        // event listeners
        this.buttonAddEntity.addEventListener("click", this._onAddEntity);
        this.buttonChangeEncounter.addEventListener("click", this._onChangeEncounter);
        this.buttonSort.addEventListener("click", this._onSortEncounter);

        // load the encounter into a table
        this._loadEncounterEntities();
    }

    async _loadEncounterEntities()
    {
        // update the form
        this.encounterLegend.textContent = `Encounter: ${this.encounter.name}`;
        // get our entities from the server
        for (let index = 0; index < this.encounter.entities.length; index++)
        {
            // get our id from the array
            const entity_id = this.encounter.entities[index];
            // get the entity from the server
            const result = await fetch(`/get/entity/${entity_id}`, { method: "GET" });
            const json = await result.json();
            // convert the json to an object
            const received_entity = JSON.parse(json);
            // check if our entity is null
            if (received_entity === null) continue;
            // add the entity to the encounter table
            this._createEntityRow(received_entity);
        }
        // sort the encounter
        this._onSortEncounter(null);
        // show our encounter view
        this.encounterView.classList.remove("hidden");
    }

    _createEntityRow(entity)
    {
        // create our table data elements

        // id
        let td_id = document.createElement("td");
        td_id.appendChild(document.createTextNode(entity._id));

        // name
        let td_name = document.createElement("td");
        td_name.appendChild(document.createTextNode(entity.name));

        // ac
        let td_ac = document.createElement("td");
        td_ac.appendChild(document.createTextNode(entity.ac));

        // hp
        let td_hp = document.createElement("td");
        td_hp.appendChild(document.createTextNode(`${entity.current_hp}/${entity.max_hp}`));

        // change hp
        let td_change_hp = document.createElement("td");
        // create the damage button
        let button_damage = document.createElement("button");
        button_damage.textContent = "Dmg";
        button_damage.setAttribute("class", "small_button");
        button_damage.addEventListener("click", this._removeHp);
        // create the input to change hp
        let input_change_hp = document.createElement("input");
        input_change_hp.setAttribute("type", "number");
        input_change_hp.setAttribute("min", "0");
        input_change_hp.setAttribute("max", "999");
        input_change_hp.setAttribute("class", "small_input");
        input_change_hp.setAttribute("placeholder", "0");
        // create the heal button
        let button_heal = document.createElement("button");
        button_heal.textContent = "Heal";
        button_heal.setAttribute("class", "small_button");
        button_heal.addEventListener("click", this._addHp);
        // add the elements to the change hp td
        td_change_hp.appendChild(button_damage);
        td_change_hp.appendChild(input_change_hp);
        td_change_hp.appendChild(button_heal);

        // initiative
        let td_initiative = document.createElement("td");
        // create the input for the initiative
        let input_initiative = document.createElement("input");
        input_initiative.setAttribute("type", "number");
        input_initiative.setAttribute("min", "0");
        input_initiative.setAttribute("max", "99");
        input_initiative.setAttribute("class", "small_input");
        input_initiative.setAttribute("placeholder", "0");
        // only set our initiative if it is a number
        const init = parseInt(entity.initiative)
        if (isNaN(init))
        {
            input_initiative.value = "";
        }
        else
        {
            input_initiative.value = init;
        }
        // add our event listener
        input_initiative.addEventListener("change", this._onUpdateEntity);
        // add the input to the initiative td
        td_initiative.appendChild(input_initiative);

        // url
        let td_url = document.createElement("td");
        // create a link for our url
        let anchor = document.createElement("a");
        anchor.setAttribute("target", "_blank");
        anchor.appendChild(document.createTextNode("link"));
        anchor.href = entity.url;
        td_url.appendChild(anchor);

        // remove
        let td_remove = document.createElement("td");
        // create the remove button
        let button_remove = document.createElement("button");
        button_remove.textContent = "X";
        button_remove.setAttribute("class", "entity-remove-button");
        button_remove.addEventListener("click", (event) => this._removeEntity(event, this.encounter));
        // add the button to the remove td
        td_remove.appendChild(button_remove);

        // create a table row
        let tr = document.createElement("tr");
        // add our table data to our table row
        tr.appendChild(td_id);
        tr.appendChild(td_name);
        tr.appendChild(td_ac);
        tr.appendChild(td_hp);
        tr.appendChild(td_change_hp);
        tr.appendChild(td_initiative);
        tr.appendChild(td_url);
        tr.appendChild(td_remove);

        // finally, add our tr to our table
        this.encounterTableBody.appendChild(tr);
    }

    async _removeEntity(event, encounter)
    {
        // get our table body
        const table = document.querySelector("#encounter-table");
        // get the button that was clicked
        const button = event.toElement;
        // get the row index of the clicked button
        const row_index = button.parentElement.parentNode.rowIndex;
        // get our entity id from the table
        const entity_id = table.rows[row_index].cells[0].textContent;
        // update the encounter on the server
        const result = await fetch(`/update/encounter/${encounter._id}/remove/entity/${entity_id}`,  { method: "POST" });
        // get our result
        const json = await result.json();
        const update_result = JSON.parse(json);
        // update our table if the encounter was updated
        if (update_result.done === true)
        {
            // create a new array
            const new_entities = [];
            // add each id to the array that doesn't match our removed id
            this.encounter.entities.forEach(ent_id =>
            {
                if (entity_id !== ent_id) new_entities.push(ent_id);
            });
            // put the new array in place
            this.encounter.entities = new_entities;
            // delete the row from the table
            table.deleteRow(row_index);
        }
    }

    _changeHpValue(button, mode)
    {
        // get the row index of the clicked button
        const row_index = button.parentElement.parentNode.rowIndex;
        // get our table body
        const table = document.querySelector("#encounter-table");
        // get our hp values
        const hp = table.rows[row_index].cells[3].textContent.split("/");
        let current_hp = parseInt(hp[0]);
        const max_hp = parseInt(hp[1]);
        // get our input element
        const input  = button.parentElement.children[1];
        // check if we don't have a value
        if (input.value === "") return;
        // get our input value as an integer
        let value = parseInt(input.value);
        // check if we got a NaN value
        if (isNaN(value)) return;
        // check for min and max values
        if (value > 999) value = 999;
        if (value < 0) value = 0;
        // update our current hp
        switch(mode)
        {
            case "add":
                current_hp = current_hp + value;
                // check if we are above our max
                if (current_hp > max_hp)
                {
                    // if we are, set our current hp to our max hp
                    current_hp = max_hp;
                }
                break;
            case "remove":
                current_hp = current_hp - value;
                break;
            default:
                return;
        }
        // update our table cell
        const hp_str = `${current_hp}/${max_hp}`;
        table.rows[row_index].cells[3].textContent = hp_str;
        console.log(`${mode} ${value} hp (${hp_str})`);
        // finally, reset our input box
        input.value = "";
    }

    _addHp(event)
    {
        // add hp to our entity
        this._changeHpValue(event.toElement, "add");
        // update the entity on the server
        this._onUpdateEntity(event);
    }

    _removeHp(event)
    {
        // remove hp from our entity
        this._changeHpValue(event.toElement, "remove");
        // update the entity on the server
        this._onUpdateEntity(event);
    }

    _onAddEntity(event)
    {
        // hide our encounter view
        this.encounterView.classList.add("hidden");
        // create our entity view
        if (this.objEntityView === null)
        {
            this.objEntityView = new EntityView(this.entityView, this);
        }
        // show our entity view
        this.entityView.classList.remove("hidden");
    }

    _onChangeEncounter(event)
    {
        // clear the encounter
        this.encounter = null;
        // clear the table's body
        this.encounterTableBody.innerHTML = "";
        // clear our legend text
        this.encounterLegend.textContent = "";
        // hide our encounter view
        this.encounterView.classList.add("hidden");
        // show our initial view
        this.initialView.classList.remove("hidden");
    }

    async addEntity(entity)
    {
        // if we already have this entity in our encounter, skip adding it
        if (this.encounter.entities.includes(entity._id)) return;
        // update the encounter on the server
        const result = await fetch(`/update/encounter/${this.encounter._id}/add/entity/${entity._id}`, { method: "POST" });
        // get our result
        const json = await result.json();
        const update_result = JSON.parse(json);
        // update our table if the encounter was updated
        if (update_result.done === true)
        {
            // add the entity to the entity array in the encounter
            this.encounter.entities.push(entity._id);
            // add the entity to the table
            this._createEntityRow(entity)
        }
    }

    setEncounter(encounter)
    {
        // set our encounter
        this.encounter = encounter;
        // and load the required entities
        this._loadEncounterEntities();
    }

    _onSortEncounter(event)
    {
        // create an array to store our rows
        const table_rows = [];
        // add all our rows to the array
        const children = this.encounterTableBody.children;
        for (let index = 0; index < children.length; index++)
        {
            table_rows.push(children[index]);
        }
        // sort the array based on the initiative input
        table_rows.sort((a, b) => (parseInt(a.cells[5].children[0].value) <= parseInt(b.cells[5].children[0].value)) ? 1 : -1);
        // add the array tr back into the table in the sorted order
        table_rows.forEach(row =>
        {
            this.encounterTableBody.appendChild(row);
        });
    }

    async _onUpdateEntity(event)
    {
        // get our element that triggered the event
        const element = event.srcElement;
        // get our table
        const table = document.querySelector("#encounter-table");
        // get the row index of the element
        const row_index = element.parentElement.parentNode.rowIndex;
        // get our id
        const id = table.rows[row_index].cells[0].textContent;
        // get our hp values
        const full_hp = table.rows[row_index].cells[3].textContent.split("/");
        let current_hp = parseInt(full_hp[0]);
        // get our initiative
        const init = parseInt(table.rows[row_index].cells[5].children[0].value);
        // stop if our hp or initiative is not a number
        if (isNaN(current_hp) || isNaN(init)) return;
        // update the entity on the server
        const result = await fetch(`/update/entity/${id}/hp/${current_hp}/init/${init}`, { method: "POST" });
        // get our result
        const json = await result.json();
        const update_result = JSON.parse(json);
    }
}

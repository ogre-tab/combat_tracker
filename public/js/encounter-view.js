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
        this.encounter = encounter;

        // bind methods
        this._addHp = this._addHp.bind(this);
        this._removeHp = this._removeHp.bind(this);
        this._onAddEntity = this._onAddEntity.bind(this);
        this._onChangeEncounter = this._onChangeEncounter.bind(this);

        // event listeners
        this.buttonAddEntity.addEventListener("click", this._onAddEntity);
        this.buttonChangeEncounter.addEventListener("click", this._onChangeEncounter);

        // load the encounter into a table
        this._loadEncounterEntities();
    }

    async _loadEncounterEntities()
    {
        // create our search parameters
        const params = {entities: this.encounter.entities}
        // create our fetch options and add our parameters
        const fetchOptions =
        {
            method: "post",
            headers:
            {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(params)
        };
        // get the entities from the server
        const result = await fetch("/get/entities", fetchOptions);
        const json = await result.json();
        // convert the json to objects
        const received_entities = JSON.parse(json);
        // update the form
        this.encounterLegend.textContent = `Encounter: ${this.encounter.name}`;
        console.log(received_entities);
        received_entities.forEach(entity =>
        {
            this._createEntityRow(entity);
        });
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
        input_initiative.value = entity.initiative;
        // add the input to the initiative td
        td_initiative.appendChild(input_initiative);

        // url
        let td_url = document.createElement("td");
        td_url.appendChild(document.createTextNode(entity.url));

        // update
        let td_update = document.createElement("td");
        // create the update button
        let button_update = document.createElement("button");
        button_update.textContent = "Update";
        // add the button to the update td
        td_update.appendChild(button_update);

        // remove
        let td_remove = document.createElement("td");
        // create the remove button
        let button_remove = document.createElement("button");
        button_remove.textContent = "X";
        button_remove.addEventListener("click", this._removeEntity);
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
        tr.appendChild(td_update);
        tr.appendChild(td_remove);

        // finally, add our tr to our table
        this.encounterTableBody.appendChild(tr);
    }

    _removeEntity(event)
    {
        // get our table body
        const table = document.querySelector("#encounter-table");
        // get the button that was clicked
        const button = event.toElement;
        // get the row index of the clicked button
        const row_index = button.parentElement.parentNode.rowIndex;
        // delete the row from the table
        table.deleteRow(row_index);
        console.log(`remove id: STUFF HERE`);
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
    }

    _removeHp(event)
    {
        // remove hp from our entity
        this._changeHpValue(event.toElement, "remove");
    }

    _onAddEntity(event)
    {
        // hide our encounter view
        this.encounterView.classList.add("hidden");
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
}

class EntityView
{
    constructor(containerElement, objEncounterView)
    {
        this.containerElement = containerElement;
        this.encounterView = document.querySelector("#encounter-view");
        this.entityView = document.querySelector("#entity-view");
        this.buttonAdd = document.querySelector("#entity-button-add");
        this.buttonCancel = document.querySelector("#entity-button-cancel");
        this.buttonCreate = document.querySelector("#entity-button-create");
        this.buttonRefresh = document.querySelector("#entity-button-refresh");
        this.buttonDelete = document.querySelector("#entity-button-delete");
        this.selectAddEntity = document.querySelector("#entity-select-entity");
        this.inputEntityName = document.querySelector("#entity-input-name");
        this.inputEntityAc = document.querySelector("#entity-input-ac");
        this.inputEntityHp = document.querySelector("#entity-input-hp");
        this.inputEntityUrl = document.querySelector("#entity-input-url");
        this.objEncounterView = objEncounterView;
        this.entities = {};

        // bind methods
        this._onAddEntity = this._onAddEntity.bind(this);
        this._onCreateEntity = this._onCreateEntity.bind(this);
        this._onRefreshEntities = this._onRefreshEntities.bind(this);
        this._onDeleteEntity = this._onDeleteEntity.bind(this);
        this._onCancel = this._onCancel.bind(this);

        // event listeners
        this.buttonAdd.addEventListener("click", (event) => this._onAddEntity(event, this.entities));
        this.buttonCreate.addEventListener("click", this._onCreateEntity);
        this.buttonRefresh.addEventListener("click", this._onRefreshEntities);
        this.buttonDelete.addEventListener("click", this._onDeleteEntity);
        this.buttonCancel.addEventListener("click", this._onCancel);

        // start this view
        this._getEntities();
    }

    async _getEntities()
    {
        // fetch the entity data from the server
        const entities = await fetch("/get/entities");
        const json = await entities.json();
        // check if we got any encounters
        if (json.length === 0)
        {
            console.log("got no entities");
        }
        else
        {
            // parse our encounter objects
            const received_entities = JSON.parse(json);
            // clear our entity dictionary
            this.entities = {};
            // clear our select element
            this.selectAddEntity.innerHTML = "";
            // add each encounter to our select element and our dictionary
            received_entities.forEach(ent =>
            {
                // create an option element
                const option = document.createElement("option");
                // create a display name for the option
                const display_name = `${ent.name} (HP: ${ent.max_hp}, AC: ${ent.ac})`;
                // set the entity name as our option's text
                option.appendChild(document.createTextNode(display_name));
                // set entity id to our option's value
                option.value = ent._id;
                // add the option to our select
                this.selectAddEntity.appendChild(option);
                // add our entity to our entity dictionary
                this.entities[ent._id] = ent;
            });
        }
    }

    async _onCreateEntity(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // don't create an entity if the name is empty
        if (this.inputEntityName.value === "") return;
        // update our ac and hp values
        let ac = this.inputEntityAc.value;
        let hp = this.inputEntityAc.value;
        if (ac > 99) ac = 99;
        if (ac < 0) ac = 0;
        if (hp > 999) ac = 999;
        if (hp < 0) ac = 0;
        // create our parameters by getting our entity values
        const params =
        {
            name: this.inputEntityName.value,
            ac: ac,
            hp: hp,
            url: this.inputEntityUrl.value
        }
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
        const result = await fetch("/create/entity", fetchOptions);
        const json = await result.json();
        // convert the json to objects
        const received_entity = JSON.parse(json);
        // add our entity to the encounter view
        this.objEncounterView.addEntity(received_entity);
        // hide our entity view
        this.entityView.classList.add("hidden");
        // show our encounter view
        this.encounterView.classList.remove("hidden");
        // clear our options from our select
        this.selectAddEntity.innerHTML = "";
        // clear our input values
        this.inputEntityName.value = "";
        this.inputEntityAc.value = "";
        this.inputEntityHp.value = "";
        this.inputEntityUrl.value = "";
        // refresh our entities list to add the newly created entity
        this._getEntities();
    }

    _onAddEntity(event, entities)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // get our selection
        const selection = this.selectAddEntity.options[this.selectAddEntity.selectedIndex];
        // check that we have something selected
        if (selection === undefined) return;
        // get our id from the selected option
        const selected_id = selection.value;
        // get our entity from the entity dictionary using the selected id
        const entity = entities[selected_id];
        // add our entity to the encounter
        this.objEncounterView.addEntity(entity);
        // hide our entity view
        this.entityView.classList.add("hidden");
        // show our encounter view
        this.encounterView.classList.remove("hidden");
        // clear our selection
        this.selectAddEntity.selectedIndex = -1;
    }

    _onRefreshEntities(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // clear our options from our select
        this.selectAddEntity.innerHTML = "";
        // get our encounter list
        this._getEntities();
    }

    async _onDeleteEntity(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // get our selection
        const selection = this.selectAddEntity.options[this.selectAddEntity.selectedIndex];
        // check that we have something selected
        if (selection === undefined) return;
        // get our id from the selected option
        const selected_id = selection.value;
        // create our parameters by getting our encounter name
        const params = { _id: selected_id }
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
        const result = await fetch("/delete/entity", fetchOptions);
        const json = await result.json();
        // get our result
        const delete_result = JSON.parse(json);
        // delete the encounter from the select if delete was successful
        if (delete_result.done === true)
        {
            // remove the option from the select
            this.selectAddEntity.remove(this.selectAddEntity.selectedIndex);
        }
    }

    _onCancel(event)
    {
        // hide our entity view
        this.entityView.classList.add("hidden");
        // show our encounter view
        this.encounterView.classList.remove("hidden");
    }
}

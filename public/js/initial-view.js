class InitialView
{
    constructor(containerElement)
    {
        this.containerElement = containerElement;
        this.initialView = document.querySelector("#initial-view");
        this.encounterView = document.querySelector("#encounter-view");
        this.buttonLoad = document.querySelector("#initial-button-load");
        this.buttonCreate = document.querySelector("#initial-button-create");
        this.buttonRefresh = document.querySelector("#initial-button-refresh");
        this.buttonDelete = document.querySelector("#initial-button-delete");
        this.selectLoadEncounter = document.querySelector("#initial-select-encounter");
        this.inputEncounterName = document.querySelector("#initial-input-encounter");
        this.encounters = null;
        this.selectedEncounter = null;

        // bind methods
        this._onLoadEncounter = this._onLoadEncounter.bind(this);
        this._onCreateEncounter = this._onCreateEncounter.bind(this);
        this._onRefreshEncounters = this._onRefreshEncounters.bind(this);
        this._onDeleteEncounter = this._onDeleteEncounter.bind(this);

        // event listeners
        this.buttonLoad.addEventListener("click", this._onLoadEncounter);
        this.buttonCreate.addEventListener("click", this._onCreateEncounter);
        this.buttonRefresh.addEventListener("click", this._onRefreshEncounters);
        this.buttonDelete.addEventListener("click", this._onDeleteEncounter);

        // start this view
        this._getEncounters();
    }

    async _getEncounters()
    {
        // fetch the encounter data from the server
        const encounters = await fetch("/get/encounters");
        const json = await encounters.json();
        // check if we got any encounters
        if (json.length === 0)
        {
            console.log("got no encounters");
        }
        else
        {
            // clear our selected encounter
            this.selectedEncounter = null;
            // parse our encounter objects
            this.encounters = JSON.parse(json);
            // add each encounter to our select element
            this.encounters.forEach(enc =>
            {
                // create an option element
                const option = document.createElement("option");
                // set the encounter name as our option's text
                option.appendChild(document.createTextNode(enc.name));
                // set encounter id to our option's value
                option.value = enc._id;
                // add the option to our select
                this.selectLoadEncounter.appendChild(option);
            });
        }
    }

    async _onCreateEncounter(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // don't create an encounter if the name is empty
        if (this.inputEncounterName.value === "") return;
        // create our parameters by getting our encounter name
        const params = {name: this.inputEncounterName.value}
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
        const result = await fetch("/create/encounter", fetchOptions);
        const json = await result.json();
        // convert the json to objects
        const received_encounter = JSON.parse(json);
        console.log(received_encounter);
        // hide our initial view
        this.initialView.classList.add("hidden");
        // create our encounter view
        const encounterView = new EncounterView(this.initialView, received_encounter);
        // clear our options from our select
        this.selectLoadEncounter.innerHTML = "";
        // clear our create encounter name
        this.inputEncounterName.value = "";
        // refresh our encounters list to get add the newly created encounter
        this._getEncounters();
    }

    _onLoadEncounter(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // get our selection
        const selection = this.selectLoadEncounter.options[this.selectLoadEncounter.selectedIndex];
        // check that we have something selected
        if (selection === undefined) return;
        // get our id from the selected option
        const selected_id = selection.value;
        // get our encounter from the encounters array using the selected id
        this.encounters.forEach(enc =>
        {
            if (enc._id === selected_id)
            {
                this.selectedEncounter = enc;
            }
        });
        // hide our initial view
        this.initialView.classList.add("hidden");
        // create our encounter view
        const encounterView = new EncounterView(this.initialView, this.selectedEncounter);
        // clear our selection
        this.selectLoadEncounter.selectedIndex = -1;
    }

    _onRefreshEncounters(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // clear our options from our select
        this.selectLoadEncounter.innerHTML = "";
        // get our encounter list
        this._getEncounters();
    }

    async _onDeleteEncounter(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // get our selection
        const selection = this.selectLoadEncounter.options[this.selectLoadEncounter.selectedIndex];
        // check that we have something selected
        if (selection === undefined) return;
        // get our id from the selected option
        const selected_id = selection.value;
        // create our parameters by getting our encounter name
        const params = {_id: selected_id}
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
        const result = await fetch("/delete/encounter", fetchOptions);
        const json = await result.json();
        // get our result
        const delete_result = JSON.parse(json);
        // delete the encounter from the select if delete was successful
        if (delete_result.deleted === true)
        {
            // remove the option from the select
            this.selectLoadEncounter.remove(this.selectLoadEncounter.selectedIndex);
        }
    }
}

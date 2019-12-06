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
        this.objEncounterView = null;
        this.encounters = {};
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
        const encounters_data = await fetch("/get/encounters");
        const json = await encounters_data.json();
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
            const received_encounters = JSON.parse(json);
            // clear our encounter dictionary
            this.encounters = {};
            // add each encounter to our select element
            received_encounters.forEach(enc =>
            {
                // create an option element
                const option = document.createElement("option");
                // set the encounter name as our option's text
                option.appendChild(document.createTextNode(enc.name));
                // set encounter id to our option's value
                option.value = enc._id;
                // add the option to our select
                this.selectLoadEncounter.appendChild(option);
                // add the encounter to our dictionary
                this.encounters[enc._id] = enc;
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
        const params = { name: this.inputEncounterName.value }
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
        // hide our initial view
        this.initialView.classList.add("hidden");
        // create or show our encounter view
        if (this.objEncounterView === null)
        {
            // the view doesn't exist, so create it
            this.objEncounterView = new EncounterView(this.initialView, received_encounter);
        }
        else
        {
            // the view already exists, so set our encounter and show the view
            this.objEncounterView.setEncounter(received_encounter);
            this.encounterView.classList.remove("hidden");
        }
        // clear our options from our select
        this.selectLoadEncounter.innerHTML = "";
        // clear our create encounter name
        this.inputEncounterName.value = "";
        // refresh our encounters list to add the newly created encounter
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
        // get our encounter from the encounters dictionary using the selected id
        this.selectedEncounter = this.encounters[selected_id];
        // hide our initial view
        this.initialView.classList.add("hidden");
        // create or show our encounter view
        if (this.objEncounterView === null)
        {
            // the view doesn't exist, so create it
            this.objEncounterView = new EncounterView(this.initialView, this.selectedEncounter);
        }
        else
        {
            // the view already exists, so set our encounter and show the view
            this.objEncounterView.setEncounter(this.selectedEncounter);
            this.encounterView.classList.remove("hidden");
        }
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
        // get the entities from the server
        const result = await fetch(`/delete/encounter/${selected_id}`);
        const json = await result.json();
        // get our result
        const delete_result = JSON.parse(json);
        // delete the encounter from the select if delete was successful
        if (delete_result.done === true)
        {
            // remove the option from the select
            this.selectLoadEncounter.remove(this.selectLoadEncounter.selectedIndex);
        }
    }
}

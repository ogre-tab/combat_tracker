class InitialView
{
    constructor(containerElement)
    {
        this.containerElement = containerElement;
        this.initialView = document.querySelector("#initial-view");
        this.encounterView = document.querySelector("#encounter-view");
        this.loadForm = document.querySelector("#load-form");
        this.createForm = document.querySelector("#create-form");
        this.loadEncounterSelect = document.querySelector("#load-encounter-select");
        this.encounters = null;
        this.selectedEncounter = null;

        // bind methods
        this._onLoadEncounter = this._onLoadEncounter.bind(this);

        // event listeners
        this.loadForm.addEventListener("submit", this._onLoadEncounter);

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
            // get our select element so we can add options to it
            const selectElement = this.initialView.querySelector("#load-encounter-select");
            // parse our encounter objects
            this.encounters = JSON.parse(json);
            console.log(this.encounters);
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
                selectElement.appendChild(option);
            });
        }
    }

    _onLoadEncounter(event)
    {
        // we will handle this event, so stop the default handling
        event.preventDefault();
        // get our id from the selected option
        const selected_id = this.loadEncounterSelect.options[this.loadEncounterSelect.selectedIndex].value;
        console.log(selected_id)
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
    }
}

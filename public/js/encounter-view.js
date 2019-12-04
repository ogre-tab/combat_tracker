class EncounterView
{
    constructor(containerElement, encounter)
    {
        this.containerElement = containerElement;
        this.initialView = document.querySelector("#initial-view");
        this.encounterView = document.querySelector("#encounter-view");
        this.encounterTable = document.querySelector("#encounter-table");
        this.encounterTableBody = document.querySelector("#encounter-table-body");
        this.encounterLegend = document.querySelector("#encounter-legend");
        this.encounter = encounter;
        //console.log(JSON.stringify(encounter));
        // show the form that shows the encounter and entities
        // get each entity found in the encounter.entities
        // display each entity on a table or some other container
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
        // show our encounter view
        this.encounterView.classList.remove("hidden");
    }

    _createEntityRow(entity)
    {
        // create a row to add the entity line to the encounter
        let row = this.encounterTable.insertRow(-1);
        let cell = row.insertCell(-1);
    }
}

class EncounterView
{
    constructor(containerElement, encounter)
    {
        this.containerElement = containerElement;
        this.initialView = document.querySelector("#initial-view");
        this.encounterView = document.querySelector("#encounter-view");
        this.encounter = encounter;
        console.log(JSON.stringify(encounter));
        // show the form that shows the encounter and entities
        // get each entity found in the encounter.entities
        // display each entity on a table or some other container
        this._loadEncounterEntities();
    }

    async _loadEncounterEntities()
    {
        const params = {entities: this.encounter.entities}
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
        console.log(fetchOptions);
        const result = await fetch("/get/entities", fetchOptions);
        const json = await result.json();
        console.log(json);
        const received_entities = JSON.parse(json);
        console.log(received_entities);
        // show our encounter view
        this.encounterView.classList.remove("hidden");
    }
}

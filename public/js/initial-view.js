class InitialView
{
    constructor(containerElement)
    {
        this.containerElement = containerElement;
        this._getEncounters();
    }

    async _getEncounters()
    {
        // fetch the encounter data from the server
        const encounters = await fetch("/getEncounters");
        const json = await encounters.json();
        // check if we got any encounters
        if (json.length === 0)
        {
            console.log("got no encounters");
        }
        else
        {
            // get our select element so we can add options to it
            const selectElement = this.containerElement.querySelector("#load-encounter-select");
            // parse our encounter objects
            const encounters = JSON.parse(json);
            console.log(encounters);
            // add each encounter to our select element
            encounters.forEach(enc =>
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
}

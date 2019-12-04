class App
{
    constructor()
    {
        // get the container for our initial view
        const viewContainer = document.querySelector("#initial-container");
        // create our initial view
        const initialView = new InitialView(viewContainer);
    }
}

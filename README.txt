Trenton Bodenner
12/02/2019
CS453 - Final Project

Install Requirements:
nodejs v8.16.2
mongodb v4.2.1

Use npm to install node modules:
express
body-parser
mongodb

Configure and start server:
Setup an instance of a mongodb server.
Change any config settings at the beginning of server.js.
Start the server "node server.js".
Connect with a browser on the URL given when server starts.

Test Data:
No data is include because the application can be used to create data.

Using application:
Server will create a database and two collections once the server starts.
On main page, load an existing encounter, or create a new one.
Also, encounters can be deleted permanently from this screen.

Once an encounter is created or loaded, characters can be added, removed,
or updated from the encounter screen.

Adding a character goes to the character management screen.
Characters can be create or added to an encounter.
Also, characters can be deleted permanently from this screen.

Once an encounter has been setup, add initiative values or change hit point (hp) values.
Pressing the Init button will sort the encounter by the initiative values.
Changes to hp or initiative will automatically save the character.

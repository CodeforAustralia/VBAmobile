# VBA mobile

## About

VBA mobile is a new front end for the [Victoria Biodiversity Atlas](https://vba.dse.vic.gov.au).
The project is currently beeing developed by a [team](https://codeforaustralia.github.io/biodiversity) of code for Australia fellows, in collaboration with DELWP and Parks Victoria.

## Technical details

The project is built with a nodeJs server, it connects to the current VBA backend using currently opened HTTP routes and acts as a middleware between the user's device and the VBA servers.
The server will generate light HTML5 pages to reduce the load on our user's devices. Credential and biodiversity data are pushed to the VBA servers without beeing stored by the server.

## Demo

Current prototype on Heroku -> [vbamobile.herokuapp.com](https://vbamobile.herokuapp.com).

Latest design available to see on webflow [vbamobile.webflow.io](http://vbamobile.webflow.io).


## Installation

1. Clone the repo
2. Configure your environment  variables / config file
3. Run > npm install

To convert webflow exports into usable templates : 

1. Run > npm run webflow
2. Check for broken href links

notes: This is experimental.

## Running the app

To run the app locally :

1. Run > npm start
2. Browse to localhost:3000

## Dependencies
This app requires npm and nodejs (v6) with the following packages : 

* "body-parser": "^1.15.2",
* "connect": "^3.4.1",
* "express": "^4.14.0",
* "express-handlebars": "^3.0.0",
* "express-session": "^1.14.1",
* "jsonwebtoken": "^7.1.9",
* "mongoose": "^4.6.0",
* "morgan": "^1.7.0",
* "request": "^2.74.0"
    
    

## Deployment

The latest version of the app should be running on [Heroku](https://vbamobile.herokuapp.com). Feel free to try and deploy somewhere else.

## Credits

<!--* Johan Codinha [@Panelvw](https://twitter.com/panelvw) | [github](https://github.com/JohanCodinha) | [Linkedin](https://au.linkedin.com/in/johancodinha)-->
* [Department of Environment, Land, Water and Planning](delwp.vic.gov.au/)
* [Parks Victoria] (parkweb.vic.gov.au)
* [Code for Australia](https://codeforaustralia.org)

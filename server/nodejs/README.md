stacksherpa-js (with nodejs)
==============

Requirements:

* Node.js (http://nodejs.org/)

Go to the nodejs directory and then install connect and router dependencies:

* npm install connect
* npm install router

It's necessary to add PATCH method to router module in order to work with Glance v2 API

Go to node_modules and use these two lines (lines 4,5 of router/index.js):

* var METHODS      = ['get', 'post', 'put', 'del'   , 'delete', 'head', 'options','patch'];
* var HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'DELETE', 'HEAD', 'OPTIONS','PATCH'];

Now you can run the server typing:

* node server.js

Open your browser and go to http://localhost:7070
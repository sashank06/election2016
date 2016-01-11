var express = require('express'),
  app = express(),
  cfenv = require('cfenv');

// load local VCAP configuration
//var vcapLocal = null
//try {
//  vcapLocal = require("./vcap-local.json");
//  console.log("Loaded local VCAP", vcapLocal);
//} catch (e) {
//  console.error(e);
//}
//
//// get the app environment from Cloud Foundry, defaulting to local VCAP
//var appEnvOpts = vcapLocal ? {
//  vcap: vcapLocal
//} : {}
var appEnv = cfenv.getAppEnv();

var twitterCreds = appEnv.getServiceCreds("twitterinsights");
var twitter = require('node-bluemix-helpers').Twitter(
  twitterCreds.host,
  twitterCreds.username,
  twitterCreds.password);

app.get("/api/1/messages/count", function (req, res) {
  console.log("Counting with", req.query.q);
  twitter.count(req.query.q, function (error, body) {
    if (error) {
      res.sendStatus(500);
    }
    res.send(body);
  });
});

app.get("/api/1/messages/search", function (req, res) {
  console.log("Searching with", req.query.q);
  twitter.search(req.query.q, 20, function (error, body) {
    if (error) {
      res.sendStatus(500);
    }
    res.send(body);
  });
});

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// start server on the specified port and binding host
app.listen(appEnv.port, "0.0.0.0", function () {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});

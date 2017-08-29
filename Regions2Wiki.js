var regions = require('./regions.json');
var request = require('request');
var rp = require('request-promise');
var fs = require('fs');

var regionsWiki = regions;
var noWiki = [];
var promiseArray = [];

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

for (i = 0; i < 300; i++) {
  var name = regions.features[i].properties.name.toProperCase();
  promiseArray.push(requestWiki(name, i));
}

Promise.all(promiseArray)
  .then(response => {
    addNames(response);
  })

function addNames(response) {
  for (i=0; i < response.length; i++) {
    var data = response[i];
    if (data.query.pages == -1) {
      console.log('fail');
      //do something to original (or copy of!) regions object to indicate that name isn't working.
      //Also add the name that was modified above to the object as "wikiName" or something
    } else {
      console.log('success')
      //do something to original (or copy of!) regions object to indicate that name IS working.
      //Also add the name that was modified above to the object as "wikiName"
    }
  }
}

function requestWiki(name, i) {
  var url = ['https://en.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=1&format=json&titles=', name].join('');
  return rp({
    uri: url,
    json: true
  });
}

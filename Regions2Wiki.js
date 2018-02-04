let regions = require('./regions.json');
let rp = require('request-promise');

let goodWiki = [];
let badWiki = [];

String.prototype.toProperCase = function () {
  return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

for (let region of regions.features) {
  let name = region.properties.name.toProperCase();
  loadParse(name, region);
}

async function loadParse (name, region) {
  try {
    let response = await requestWiki(name);
    addNames(response, name, region);
  } catch (error){
    console.error(error);
  }
}

function addNames(resp, name, region) {
  if (resp.query.pages['-1']) {
    // console.error('fail');
    badWiki.push(region);
    //do something to original (or copy of!) regions object to indicate that name isn't working.
    //Also add the name that was modified above to the object as "wikiName" or something
  } else {
    // console.log('success');
    for (let page in resp.query.pages) {
      // console.log(resp.query.pages[page].title, name);
      goodWiki.push(region);
    }
    //do something to original (or copy of!) regions object to indicate that name IS working.
    //Also add the name that was modified above to the object as "wikiName"
  }
}

function requestWiki(name) {
  let url = ['https://en.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=1&format=json&titles=', name].join('');
  return rp({
    uri: url,
    json: true
  });
}

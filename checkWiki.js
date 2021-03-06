const regions = require("./regions.json");
const rp = require("request-promise");
const fs = require("fs");

const goodWiki = {
  type: "FeatureCollection",
  features: []
};
const badWiki = [];

String.prototype.toProperCase = function() {
  return this.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

regions.features.map((region, index) => {
  const { name } = region.properties;
  setTimeout(() => {
    checkWiki(name.toProperCase(), region);
  }, 1 * index);
});

async function checkWiki(name, region) {
  try {
    let response = await requestWiki(name);
    addNames(response, name, region);
  } catch (error) {
    console.error(error);
  }
}

function addNames(resp, name, region) {
  if (resp.query.pages["-1"]) {
    badWiki.push(name);
  } else {
    for (const page in resp.query.pages) {
      region.properties["wikiName"] = resp.query.pages[page].title;
      region.properties["wikiId"] = page;
      goodWiki.features.push(region);
    }
  }
}

function requestWiki(name) {
  let url = [
    "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&redirects=1&format=json&titles=",
    name
  ].join("");
  return rp({ uri: url, json: true });
}

function writeFiles(name, data) {
  fs.writeFileSync(name, data, function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

process.on("exit", finish.bind());

function finish() {
  writeFiles("badWiki.json", JSON.stringify(badWiki));
  writeFiles("goodWiki.json", JSON.stringify(goodWiki));
}

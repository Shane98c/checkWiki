const rp = require("request-promise");
const fs = require("fs");

const goodWiki = [];
const badWiki = [];

const taxa = [
  "Chalicotheriinae",
  "Cetacea",
  "Andrewsarchus",
  "Brontotheriidae",
  "Indricotheriinae",
  "Dunkleosteus",
  "Chondrichthyes",
  "Phorusrhacidae",
  "Gastornithidae",
  "Argentavis",
  "Dinornis",
  "Eohippus",
  "Proboscidea",
  "Protoceratidae",
  "Rhinocerotidae",
  "Megacerops",
  "Moeritherium",
  "Ceratogaulus",
  "Gomphotherium",
  "Deinotherium",
  "Condylarthra",
  "Paraceratherium",
  "Mesonychia",
  "Pantodonta",
  "Hyaenodontidae",
  "Thylacosmilus",
  "Glyptodon",
  "Castoroides",
  "Toxodon",
  "Megatherium",
  "Arctodus",
  "Smilodon",
  "Mammuthus",
  "Mammut",
  "Coelodonta",
  "Megaloceras",
  "Gigantopithecus",
  "Phlegethontia",
  "Temnospondyli",
  "Lepospondyli",
  "Sauropterygia",
  "Pterosauria",
  "Titanoboa",
  "Megalania",
  "Placodus",
  "Tanystropheus",
  "Hyperodapedon",
  "Stagonolepis",
  "Scutosaurus",
  "Pareiasauria",
  "Archelon",
  "Stupendemys",
  "Protostega",
  "Placodermi",
  "Leedsichthys",
  "Onychodontidae",
  "Acanthostega",
  "Ichthyostega",
  "Crassigyrinus",
  "Archosauria^Aves",
  "Synapsida^Mammalia"
];

taxa.map((tna, index) => {
  setTimeout(() => {
    getPbdb(tna);
  }, 20 * index);
});

async function getPbdb(tna) {
  console.log("requesting data...");
  const url = "https://paleobiodb.org/data1.2/occs/list.json?base_name=" + tna;
  try {
    let pbdb = await rp({ uri: url, json: true });
    loopPbdb(pbdb);
  } catch (error) {
    console.error(error);
  }
}

function loopPbdb(pbdb) {
  console.log(pbdb.records.length, "records in this query");
  console.log("filtering duplicates...");
  const pbdbDeDoop = pbdb.records.filter(
    (data, index, self) => self.findIndex(t => t.tna === data.tna) === index
  );
  console.log(pbdbDeDoop.length, "unique taxa in this query");
  console.log("checking for Wiki articles...");
  pbdbDeDoop.map((record, index) => {
    const { tna } = record;
    setTimeout(() => {
      checkWiki(tna);
    }, 20 * index);
  });
}

async function checkWiki(name) {
  try {
    let response = await requestWiki(name);
    addNames(response, name);
  } catch (error) {
    console.error(error);
  }
}

function addNames(resp, name) {
  if (resp.query.pages["-1"]) {
    badWiki.push(name);
  } else {
    for (const page in resp.query.pages) {
      goodWiki.push(name);
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
  console.log(badWiki.length, "missing Wiki articles");
  console.log(goodWiki.length, "successful Wiki articles");
  writeFiles("badWiki.json", JSON.stringify(badWiki));
  writeFiles("goodWiki.json", JSON.stringify(goodWiki));
}

client = stitch.Stitch.initializeDefaultAppClient('offsite-language-app-oubno');
db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('lang');


function displayOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayStrings)
    .catch(console.error);
}

function displayStrings() {
  db.collection('strings')
    .find({}, { limit: 100 })
    .asArray()
    .then(docs => docs.map(doc => `<div>${doc.content}</div>`).join(''))
    .then(strings => document.getElementById("strings").innerHTML = strings)
    .catch(err => console.log(err));
}

function addString() {
  console.log(document.getElementById("new_string").value)
  db.collection("strings")
    .insertOne({content: document.getElementById("new_string").value})
    .catch(err => console.error(err));
}

function addWord(word) {
  db.collection("words")
    .insertOne(word)
    .catch(err => console.error(err));
}

function getWordToSave() {
  textbox = document.getElementById('paragraph')
  trinput = document.getElementById('selectionTranslation')
  t = textbox.value.substr(textbox.selectionStart, textbox.selectionEnd - textbox.selectionStart);
  console.log(t, trinput.value)
  word = {
    'from': t,
    'to': trinput.value,
    'from_lang': 'en',
    'to_lang': 'de'
  }
  addWord(word)
}

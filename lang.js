client = stitch.Stitch.initializeDefaultAppClient('offsite-language-app-oubno');
db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('lang');

function displayOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayStrings)
    .catch(console.error);
}

function createStringEntry(doc){
  cls   = "list-group-item list-group-item-action";
  id    = doc._id;

  console.log(stitch.ObjectID);
  text = doc.content;
  textList = text.split(" ");
  console.log(text);
  console.log(textList)
  var words = "";
  for (i = 0; i < textList.length; i++) {
    words += "<span>";
    words += textList[i];
    words += "</span> ";
  }
  title = text.slice(0, 20);

  listentry  = `<a class="${cls}" id="list-${id}-list" data-toggle="list" href="#list-${id}" role="tab" aria-controls="${id}">${title}</a>`;
  rmbtn      = `<div><button type="button" class="btn btn-default btn-sm" onClick="deleteString('${id}');displayStrings()"><i class="fa fa-trash" aria-hidden="true"></i></button></div>`;
  panelentry = `<div class="tab-pane fade" id="list-${id}" role="tabpanel" aria-labelledby="list-${id}-list">${rmbtn}${words}</div>`;

  $("#list-tab").append(listentry);
  $("#nav-tabContent").append(panelentry);
}

function displayStrings() {
  $("#list-tab").empty();
  $("#nav-tabContent").empty();
  db.collection('strings')
    .find({}, { limit: 100 })
    .asArray()
    .then(docs => docs.forEach(doc => createStringEntry(doc)))
    .catch(err => console.log(err));
}

function deleteString(id){
  oid = new stitch.ObjectID(id);
  console.log(id, oid);
  db.collection("strings")
    .deleteOne({_id: oid})
    .catch(err => console.error(err));
}

function addString() {
  console.log(document.getElementById("new_string").value);
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
  textbox = document.getElementById('paragraph');
  trinput = document.getElementById('selectionTranslation');
  t = textbox.value.substr(textbox.selectionStart, textbox.selectionEnd - textbox.selectionStart);
  console.log(t, trinput.value);
  word = {
    'from': t,
    'to': trinput.value,
    'from_lang': 'en',
    'to_lang': 'de'
  };
  addWord(word);
}

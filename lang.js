client = stitch.Stitch.initializeDefaultAppClient('offsite-language-app-oubno');
db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('lang');

function displayOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayStrings)
    .catch(console.error);
}

function displayStringEntry(doc){
  cls   = "list-group-item list-group-item-action"
  id    = doc._id
  text  = doc.content
  title = text.slice(0, 20)

  p     = splitString(text)
  phtml = p.html()
  console.log(p)

  listentry  = `<a class="${cls}" id="list-${id}-list" data-toggle="list" href="#list-${id}" role="tab" aria-controls="${id}">${title}</a>`
  rmbtn      = `<div><button type="button" class="btn btn-default btn-sm" onClick="deleteString('${id}')"><i class="fa fa-trash" aria-hidden="true"></i></button></div>`
  panelentry = `<div class="tab-pane fade" id="list-${id}" role="tabpanel" aria-labelledby="list-${id}-list">${rmbtn}${phtml}</div>`

  $("#list-tab").append(listentry)
  $("#nav-tabContent").append(panelentry)
  $("list-" + id).append(p)

  console.log($("list-" + id))
}

function splitString(str){
  console.log("splitter", str)
  p = jQuery("<p></p>")
  words = str.split(' ')
  for (var i = 0; i < words.length; i++) {
    word             = words[i]
    regex            = /[\!\@\#\$\%\^\&\*\(\)_\+\\\-\=\{\}\|\[\]\:"\;'\<\>\?\,\.\/「」„“]/g;
    clean_word       = word.replace(regex, '')
    word_translation = "tbd"
    span             = `<span word='${clean_word}' translation='${word_translation}' onClick=addWord(this)>${word}</span>`
    console.log(span)
    p.append(span)
  }
  return p
}

function displayStrings() {
  $("#list-tab").empty()
  $("#nav-tabContent").empty()
  db.collection('strings')
    .find({}, { limit: 100 })
    .asArray()
    .then(docs => docs.forEach(doc => displayStringEntry(doc)))
    .catch(err => console.log(err));
}

function deleteString(id){
  db.collection("strings")
    .deleteOne({_id: ObjectID(id)})
    .then(() => displayStrings())
    .catch(err => console.error(err));
}

function addString() {
  console.log(document.getElementById("new_string").value)
  db.collection("strings")
    .insertOne({content: document.getElementById("new_string").value})
    .then(() => displayStrings())
    .catch(err => console.error(err));
}

function addWord(word) {
  var from = word.textContent;
  var definition = window.prompt("Enter definition for \"\"");
  db.collection("words")
    .insertOne({from: from, to: definition})
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

//console.log("Test1", splitString("This is a simple test"))
//console.log("Test2", splitString("This# is% a ^test, but 'with' puntuation. Marks! \"and\" hyph-ens and accénts for cølation. We do want some $ymbols but not #others"))
client = stitch.Stitch.initializeDefaultAppClient('offsite-language-app-oubno');
db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('lang');

function displayOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayStrings)
    .catch(console.error);
}

function splitString(str, uniqueWords){
  p = jQuery("<p></p>")
  words = str.split(' ')
  console.log(uniqueWords)
  for (var i = 0; i < words.length; i++) {
    word             = words[i]
    regex            = /[\!\@\#\$\%\^\&\*\(\)_\+\\\-\=\{\}\|\[\]\:"\;'\<\>\?\,\.\/「」„“]/g;
    clean_word       = word.replace(regex, '')
    word_translation = ""

    for (var j = 0; j < uniqueWords.length; j++) {
      console.log(  uniqueWords[j])
      if (uniqueWords[j].from == word) {
        word = "<u>" + word + "</u>";
        word_translation = uniqueWords[j].to
        break;
      }
    }

    span = `<span word='${clean_word}' translation='${word_translation}' onClick=addWord(this)>${word} </span>`
    console.log(span)
    p.append(span)
  }

  console.log(p)
  return p
}

function displayStringEntry(doc){

  uniqueWords = {};
  db.collection('words')
    .find({from: {$in: doc.content.split(" ")}})
    .asArray()
    .then(res => {
      for (var i = 0; i < res.length; i++){
        var strdoc = res[i]
        if (strdoc.to) {
          uniqueWords[strdoc.from] = strdoc.to;
        }
      }
    })
    .then(() => {
      cls   = "list-group-item list-group-item-action"
      id    = doc._id
      text  = doc.content
      title = text.slice(0, 20)
      textList = text.split(" ");

      p     = splitString(text, uniqueWords)
      phtml = p.html()

  	  listentry  = `<a class="${cls}" id="list-${id}-list" data-toggle="list" href="#list-${id}" role="tab" aria-controls="${id}">${title}</a>`
      rmbtn      = `<div><button type="button" class="btn btn-default btn-sm" onClick="deleteString('${id}')"><i class="fa fa-trash" aria-hidden="true"></i></button></div>`
      panelentry = `<div class="tab-pane fade" id="list-${id}" role="tabpanel" aria-labelledby="list-${id}-list">${rmbtn}${phtml}</div>`

      $("#list-tab").append(listentry)
      $("#nav-tabContent").append(panelentry)

    })
    .catch(err => console.log(err));
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

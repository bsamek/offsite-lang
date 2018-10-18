client = stitch.Stitch.initializeDefaultAppClient('offsite-language-app-oubno');
db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('lang');

function displayOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayStrings)
    .catch(console.error);
}

function cleanWord(word){
  regex            = /[\!\@\#\$\%\^\&\*\(\)_\+\\\-\=\{\}\|\[\]\:"\;'\<\>\?\,\.\/「」„“]/g;
  clean_word       = word.replace(regex, '')

  return clean_word
}

function prepareNewWordModal(word, translation){
  $('#newWordModalLbl').html("Translation for '<b>"+word+"</b>'")
  $('#new_word').val(translation)
  $('#new_word_orig').val(word)
}

function splitString(str, uniqueWords){
  p = jQuery("<p></p>")
  words = str.split(' ')
  console.log(uniqueWords)
  for (var i = 0; i < words.length; i++) {
    clean_word       = cleanWord(words[i])
    word_translation = ""
    word             = ""

    if (uniqueWords.hasOwnProperty(clean_word)) {
      word = "<u>" + clean_word + "</u>";
      if (uniqueWords[clean_word]){
        word_translation = uniqueWords[clean_word]
      }
    }
    else{
      word = clean_word
    }
    //translation='${word_translation}'  
    //popover = `tabindex="0" title="Translate word" data-trigger="focus" data-placement="top" data-toggle="popover" data-content="<input type=text/>"`
    //span.popover({ trigger: 'focus' })

    span    = jQuery(`<span data-toggle="modal" data-target="#newWordModal" onClick="prepareNewWordModal('${clean_word}', '${word_translation}')">${word} </span>`)
    console.log(span)
    p.append(span)
  }

  console.log(p)
  return p
}

function displayStringEntry(doc){

  return db.collection('words')
    .find({from: {$in: doc.content.split(" ")}})
    .asArray()
    .then(res => {
      uniqueWords = {};
      for (var i = 0; i < res.length; i++){
        var strdoc = res[i]
        if (strdoc.from) {
          uniqueWords[strdoc.from] = strdoc.to;
        }
      }
      console.log('u1', uniqueWords)
      return uniqueWords
    })
    .then((uniqueWords) => {
      console.log('unique', uniqueWords)
      cls   = "list-group-item list-group-item-action"
      id    = doc._id
      text  = doc.content
      title = text.slice(0, 20)
      textList = text.split(" ");

      p     = splitString(text, uniqueWords)
      //phtml = p.html()

  	  listentry  = `<a class="${cls}" id="list-${id}-list" data-toggle="list" href="#list-${id}" role="tab" aria-controls="${id}">${title}</a>`
      rmbtn      = `<div><button type="button" class="btn btn-default btn-sm" onClick="deleteString('${id}')"><i class="fa fa-trash" aria-hidden="true"></i></button></div>`
      panelentry = jQuery(`<div class="tab-pane fade" id="list-${id}" role="tabpanel" aria-labelledby="list-${id}-list">${rmbtn}</div>`)

      panelentry.append(p)

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
    .then(() => {$('[data-toggle="popover"]').popover()})
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

function addWord() {
  translation = $('#new_word').val()
  word = $('#new_word_orig').val()
  db.collection("words")
    .updateOne({from: word}, {from: word, to: translation}, {upsert: true})
    .catch(err => console.error(err));
}

function deleteWord() {
  translation = $('#new_word').val()
  word = $('#new_word_orig').val()
  db.collection("words")
    .deleteOne({from: word})
    .catch(err => console.error(err));
}

//console.log("Test1", splitString("This is a simple test"))
//console.log("Test2", splitString("This# is% a ^test, but 'with' puntuation. Marks! \"and\" hyph-ens and accénts for cølation. We do want some $ymbols but not #others"))

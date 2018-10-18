client = stitch.Stitch.initializeDefaultAppClient('offsite-language-app-oubno');
db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('lang');

active_tab = null
string_id_list = {}

function displayOnLoad() {
  client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(displayStrings)
    .catch(console.error);
}

function cleanWord(word){
  regex            = /[\!\@\#\$\%\^\&\*\(\)_\+\\\-\=\{\}\|\[\]\:"\;'\<\>\?\,\.\/\u201e\u201c]/g;
  clean_word       = word.replace(regex, '')

  return clean_word
}

function toggleTranslation(){
  $('.word-meaning').toggle()
  console.log($('#toggleVisibilityBt').html())
  if ($('#toggleVisibilityBtn').text() == "Hide translations"){
    $('#toggleVisibilityBtn').text("Show translations")
  }
  else{
    $('#toggleVisibilityBtn').text("Hide translations")
  }
}

function prepareNewWordModal(word, translation){
  console.log('prep', word, translation)
  $('#newWordModalLbl').html("Translation for '<b>"+word+"</b>'")
  $('#new_word').val(translation)
  $('#new_word_orig').val(word)
}

function splitString(str, uniqueWords){
  p = jQuery("<p></p>")
  words = str.split(' ')
  for (var i = 0; i < words.length; i++) {
    word             = words[i]
    clean_word       = cleanWord(word)
    word_translation = ""
    cls              = "word-hover"

    if (uniqueWords.hasOwnProperty(clean_word)) {
      cls += " word-translated"
      if (uniqueWords[clean_word]){
        word_translation = uniqueWords[clean_word]
      }
    }

    span    = jQuery(`<span data-toggle="modal" class="${cls}" data-target="#newWordModal"" onClick="prepareNewWordModal('${clean_word}', '${word_translation}' )">${word}</span>`)

    p.append(span)

    if (word_translation){
      transspan = jQuery(`<span class="word-meaning">${word_translation}</span>`)
      transspan.hide()
      p.append(transspan)
    }

    p.append(" ")
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
      id    = doc._id
      text  = doc.content
      title = text.slice(0, 20)
      textList = text.split(" ");

      rmbtn   = jQuery(`<div><button type="button" class="btn btn-default btn-sm" onClick="deleteString('${id}')"><i class="fa fa-trash" aria-hidden="true"></i></button></div>`)
      p       = splitString(text, uniqueWords)

      string_id_list[`${id}`] = id

  	  listentry  = jQuery(`<a class="list-group-item list-group-item-action" id="list-${id}-list" data-toggle="list" href="#list-${id}" role="tab" aria-controls="${id}">${title}</a>`)
      panelentry = jQuery(`<div class="tab-pane fade" id="list-${id}" role="tabpanel" aria-labelledby="list-${id}-list"></div>`)

      listentry.on('shown.bs.tab', function(e) {
        console.log('event', e.target.id)
        active_tab = e.target.id
      })

      panelentry.append(rmbtn)
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
    .then(async function(docs){
      for (var i = 0; i < docs.length; i++){
        await displayStringEntry(docs[i])
      }
    })
    .then(() => {
      console.log('disp', active_tab, $('#' + active_tab))
      if (active_tab){
        $('#' + active_tab).tab('show')
      }
    })
    .catch(err => console.log(err));

}

function deleteString(id){
  db.collection("strings")
    .deleteOne({_id: string_id_list[id]})
    .then(() => delete string_id_list[id])
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
    .then(() => displayStrings())
    .catch(err => console.error(err));
}

function deleteWord() {
  translation = $('#new_word').val()
  word = $('#new_word_orig').val()
  db.collection("words")
    .deleteOne({from: word})
    .then(() => displayStrings())
    .catch(err => console.error(err));
}

//console.log("Test1", splitString("This is a simple test"))
//console.log("Test2", splitString("This# is% a ^test, but 'with' puntuation. Marks! \"and\" hyph-ens and accénts for cølation. We do want some $ymbols but not #others"))

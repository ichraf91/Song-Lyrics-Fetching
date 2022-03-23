var express = require('express');
var bodyparser = require('body-parser');
var routes = require('./routes/routes.js');
var path = require('path');
var config = require('./DataBase/mongodb');
var mongoose = require('mongoose');
const rp = require('request-promise');
const cheerio = require('cheerio');
const router = express.Router();

const { spawn } = require('child_process');
const childPython = spawn('python', ['rec_voc.py'])
var app=express();
//mongo coonfig
const connect = mongoose.connect(
  config.mongo.uri ,
  { useNewUrlParser:
  true ,
  useUnifiedTopology: true
  },
  ()=> console.log("Connected to DB !!") );
//python

 

///
app.set('views',path.join(__dirname,'views'));
app.engine('html',require('ejs').renderFile);
app.set('view engine','html');

app.use(bodyparser.json());
app.use('/',routes);
childPython.stdout.on('data',(data)=>{
  console.log(`${data}`);

  let url1=`https://search.azlyrics.com/search.php?q=${data}`
  rp(url1)
  .then((html)=>{
    /*Traverse html DOM */
    let $ = cheerio.load(html);
    let panels = $('.panel');/* There are multiple panels like Album , Song,.. */
    let url2 = '';
    /* Find Song's panel */
    panels.each((i,panel)=>{
      /*Get heading text for this panel */
      let ph = $(panel).find('.panel-heading b').text();
      if(ph=='Song results:'){
        /*Get all anchor tags in this panel */
        let links = $(panel).find('.text-left>a');//about 20 links
        url2 = $($(links)[0]).attr('href');//get the first one 
        return;//break loop
      }
    });
    /* Send the lyric url to next promise */
    return url2;
    
  })
  .then((url)=>{
    console.log(url)
    /*Visit the Lyrics Page Url */
    rp(url)
    .then((html)=>{
      /*Traverse DOM to scrap lyrics from this page */
      let $ = cheerio.load(html);
      let lyrics = $('.ringtone').nextAll().text();
      /*Send Results */
     // res.send(lyrics);
     console.log(lyrics);
    })
    .catch((err)=>{
      // console.log(err);
     // res.send('Lyrics Not Found 1;(');
     console.log('err');
    });
  })
  .catch((err)=>{
    // console.log(err);
    //res.send('Lyrics Not Found 2;(');
    console.log('err');
})


});
  //
//})

app.listen(2000,function(){
  console.log('Server Started on Port 2000 ...');
});


//node index
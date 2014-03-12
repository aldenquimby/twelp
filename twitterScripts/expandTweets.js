

// **************************
// ****** DEPENDENCIES ******
// **************************

var proc     = require('../util/process'); 
var database = require('../api/database'); 
var fs       = require('fs');
var _        = require('lodash');
var twitter  = require('../api/twitterApi');

// *********************
// ****** PROGRAM ******
// *********************

var tweetsToExpand = [ 
  '399756894098583552',
  '406740861402513408',
  '411930421145128960',
  '388856429844901888',
  '388731852020023296',
  '388875184968855552',
  '389577971532443648',
  '389406738681970688',
  '388080314150440960',
  '389595163124711424',
  '391606408405209089',
  '392650394465472512',
  '400030770489614337',
  '399950310443335680',
  '399762896223469568',
  '392773439129681920',
  '399957072793436160',
  '399735229105311744',
  '400840301935620097',
  '394894910228557824',
  '395036327391268864',
  '404605402060685312',
  '413402335143288832',
  '414419186858094592',
  '389577992709873664',
  '390292076463923200',
  '389987857835626496',
  '389944864689098752',
  '389784043367067648',
  '391291944682680321',
  '392819478616354816',
  '392818178730254336',
  '394114287503171584',
  '393987387506057216',
  '390230026685513728',
  '388916528017854464',
  '388305869756456960',
  '388343665090756608',
  '388031141925515264',
  '391326865560190976',
  '392519292446851072',
  '392102868922019840',
  '391360858623729664',
  '392777612265000960',
  '393115425195585536',
  '393524319533268992',
  '393236859461312512',
  '400045084642914304',
  '399804808179105793',
  '399762201252478976' 
];


var expandConvo = function(tweets) {

    var toFile = './private/convo-tweets-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';

    _.each(tweets, function(tweet) {

      twitter.trackConversionBack(tweet, 3, function(err2, convo) {
        if (err2) { proc.bail('Convo tracking failed', err2); }

        _.each(convo, function(t) {
          t.tags.push('convo');
          t.tags.push('convo-' + tweet.id);
        });

        fs.appendFile(toFile, JSON.stringify(convo) + "\n", function(err) {
          if (err) { proc.bail('Failed to save file', err); }
        });

      });

    });

};

var expandUser = function(tweets) {

  var toFile = './private/user-tweets-' + new Date().toJSON().replace(/:|-/g, '').replace('.', '') + '.json';

  _.each(tweets, function(tweet) {

    twitter.userTimeline(tweet.user.id, null, tweet.id, function(err2, backwards) {
      if (err2) { proc.bail('Backward tracking failed', err2); }

      _.each(backwards, function(t) {
        t.tags.push('user');
        t.tags.push('user-' + tweet.user.id);
        // screen name not set on result, so add it
        t.user.screen_name = tweet.user.screen_name;
      });

      fs.appendFile(toFile, JSON.stringify(backwards) + "\n", function(err) {
        if (err) { proc.bail('Failed to save file', err); }
      });

    });

    twitter.userTimeline(tweet.user.id, tweet.id, null, function(err2, forwards) {
      if (err2) { proc.bail('Forward tracking failed', err2); }

      _.each(forwards, function(t) {
        t.tags.push('user');
        t.tags.push('user-' + tweet.user.id);
        // screen name not set on result, so add it
        t.user.screen_name = tweet.user.screen_name;
      });

      fs.appendFile(toFile, JSON.stringify(forwards) + "\n", function(err) {
        if (err) { proc.bail('Failed to save file', err); }
      });

    });

  });

};

database.runWithConn(function() {

  database.findTweets({ "id": { "$in": tweetsToExpand } }, function(err, tweets) {
    if (err) { proc.bail('Failed to find tweets', err); }

    expandUser(tweets);
    // expandConvo(tweets);

  });

});

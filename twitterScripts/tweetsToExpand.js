// **************************
// ****** DEPENDENCIES ******
// **************************

var proc     = require('../util/processUtil'); 
var database = require('../api/database'); 
var fs       = require('fs');
var _        = require('lodash');

// ************************
// ******** TWEETS ********
// ************************

	var positiveTweets = [

	  "Food poisoning sucks! Never eating subway again😨 #needsleep #drained"
	, "I will NEVER eat processed meat EVER again.....Pret has betrayed me  #foodpoisoning"
	, "@patchen828 I'm never eating the trash you sell at McNasties ever again. #sick"
	, "Worst case of food poisoning ever. I'm never eating Bubbas Burrito Bar again!"
	, "diarrhea ? RT @5starbNotChilln: Never eating chipotle again"

	, "the good news about rapidly dropping weight from this stomach bug is that i get to cosplay christian bale"
	, "semi food poisoning is no fun"
	, "living day 2 of food poisoning fun"
	, "food poisoning in nyc sick matee"
	, "hmm food poisoning or stomach flu"
	, "after a week off thanks food poisoning i m back at it tonight viproomnyc"
	, "food poisoning refrain from seaweed salad"
	, "kidwhorauhls wisebiebs i feel horrible food poisoning is the worst feel better babe"
	, "flatironschool i picked the wrong day to suffer from horrific food poisoning"
	, "i m scared because i think i have food poisoning and my moms not even here to help me"
	, "rcshowman taco bell is 2nd tier c mon now p s don t bury the lede i had food poisoning and i still ate a frisco melt w a banana shake"
	, "still fighting off possible food poisoning today how s your monday going"
	, "litrally smebody s food in financial services like have me good poisoning lr"
	, "baucesauce i just got food poisoning thanks"
	, "going in for another pumpkin spice latte even though it gave me food poisoning a few years back love starbucks"
	, "food poisoning this morning blah"
	, "since i ve had food poisoning i ve lost 7lbs i m so freaking mad"
	, "i think i just got food poisoning"
	, "back in the game after a bout of food poisoning and ready as fuck for the behance team thanksgiving lunch today i m so hungry"
	, "shud i tell my teacher i have food poisoning lmao collegeproblems"
	, "first three day weekends food poisoning fml"
	, "justin has food poisoning nrelax yourselves"
	, "had to cancel my movie dinner plans cos of this stupid food poisoning so bummed out my weekend was gone to waste"
	, "elterlly b _somebody s food in financial services like have me good poisoning w"
	, "brother has food poisoning heturntuptoomuchatthatassembly"
	, "loveourari pray for justin everyone he has food poisoning"
	, "fuck food poisoning"
	, "food poisoning at 38 is much worse than at 28 i think i bruised my throat vomiting if that s possible"
	, "trying to fight off this food poisoning that i have had for the last two days i am so miserable i would never wish this on anyone"
	, "sometimes i forget ive been to las vegas that trip still makes me happy even tho i got violent food poisoning at the acting awards ceremony"
	, "fate_monstrous tear_taylor mlg_seahorse i may or may not have food poisoning"
	, "linzwashburn sounds like maybe food poisoning"
	, "food poisoning the day before i go back to high point yup that s awesome"

	, "feeling much better after my food poisoning back to my old self again thank god"
	, "super sick i think i have food poisoning wish i didn t need to come into work today"
	, "may have accidentally given self food poisoning yes that is possible no you do not want to know"
	, "i got food poisoning _________"
	, "southern taste gave me food poisoning"
	, "nicklazzara don t go we all got food poisoning last time i went"
	, "thought i d had too much wine am pretty sure it is food poisoning i want to die"
	, "i definitely just got food poisoning from empires popcorn taking galaxy employees down one at a time"
	, "i think i got food poisoning"
	, "webmded my symptoms fatigue stomach ache body ache etc and there s a chance i have polio or ebola or just food poisoning feelingill"
	, "food poisoning is the worst thing that can happen to a person i m dying goodbye"
	, "hillaryannw denys will do that to you got some gross food poisoning from there"
	, "bcdreyer kalenski followed by a nice case of food poisoning"
	, "last time i had a jamaican made roti i got food poisoning"
	, "proaudiotommy i got food poisoning from brueggers in like 01 hangin after a show puked and shat fucking everywhere nothorny"
	, "i def got food poisoning that shit was terrible yesterday and it still hurts"

	, "it s not that he s exhausted he got food poisoning it was such a freak accident i feel bad"
	, "stratfordsbliss food fucking poisoning"
	, "i got food poisoning from pizza and i m pretty sure this is most betrayed i have ever felt in my life"
	, "justin has food poisoning he it s going to die i don t think he would want his fans this stressed over him enjoy and support his music"
	, "yliterlly somebody s food in finncial services like have me good poisoning"
	, "hauntedempireny 100 better food poisoning was all it was i will be back on my a game friday"
	, "but i have food poisoning so"
	, "food poisoning is the worst thing you could ever experience holy shit"
	, "jcommaa ate food poisoning today along with a bunch other nasty things"
	, "food poisoning is the worst a waste of a day"
	, "still feeling sicky i swear this feel like food poisoning"
	, "phoebebfriends r_gellerfriends i think i got food poisoning"
	, "i think i got food poisoning shrimp is the devil"
	, "actually no hot chocolate bc he has food poisoning so thatll either go up one end or out the other"

	, "man that food poisoning stomach bug i had over thanksgiving is still kicking my ass"
	, "i didn t eat all day yesterday because of this food poisoning"
	, "food poisoning help me"
	, "i m so glad i got food poisoning the day after thanksgiving i think i lost 5 lbs fashionbetch skinnybitch"
	, "kdakeis i just got over food poisoning and i swear i ate breakfast for like 5 meals straight glad you re feeling better"
	, "i got food poisoning today i don t know when i ll use it"
	, "alanmallouhi i would but i m literally dying in bed since i have food poisoning"
	, "ugh bad food poisoning feel like i got punched in the gut notcool"

	, "so it turns out i had food poisoning sorry uptown some places won t see me again on soup and water for the next few days smh"
	, "i survived these past 15 hours of food poisoning i would never wish food poisoning upon anyone"
	, "food poisoning sucks never eating subway again needsleep drained"
	, "food poisoning sucks kill me now"
	, "think i have food poisoning"
	, "still not sure what i have but it s either a stomach bug or food poisoning gonna have a talk about the food mimiflowerchild left me"
	, "nffc65 oh no pobrecito was it food poisoning"
	, "flawlessfaves a pray for justin trend is appropriate because he s thrown up several times he has food poisoning amp he s dehydrated so"
	, "willdelagarza really staystrongjustin justin just has food poisoning he will be fine what about the victims of the typhoon i"
	, "i think i ve got food poisoning from drinking these 8 beers"
	, "oh man i forgot for two minutes that i just had food poisoning and i ate a cookie and now i regret my life choices"
	, "nothing like waking up with food poisoning fml"
	, "imfernly no i said that because i got food poisoning from there saturday night lol"
	, "broken toe smashed car now food poisoning well when ur down the only place to go is up hopefully w my bdy this wk things will be bttr"
	, "not sure if the chicken roll or chicken soup i left for 6 hours unrefrigerated that gave me food poisoning but i m sure i ll do both again"
	, "darrenrovell and zogblog and i were near death after some 40 40 club food poisoning thanks jay z s personal chef"
	, "food poisoning last night for me is a great way to kickstart my new years resolution of puking and shitting more"
	, "got food poisoning not the best thing right now and i miss my lady"
	, "so i have the flu amp mom has food poisoning"
	, "food poisoning has to be the worst"
	, "nickduval44 lol not exactly more like an empty stomach from bad food poisoning"
	, "great start to december as clock struck midnight fever amp food poisoning symptoms set in 102 is exactly how i wanted to start a new month"
	, "peiwei bvirgo got food poisoning from the mongolian beef and broccoli at your las vegas airport location last wed just fyi"
	, "tywhitemusic food poisoning"
	, "i think i m experiencing food poisoning helpwanted"
	, "er soon food poisoning"
	, "eat so much chinese food i got lead poisoning"
	, "dear food poisoning you suck imisseating"
	, "i m thinking i might have gotten food poisoning and if it is food poisoning i definitely got it from the walmart deli food i had on friday"
	, "aaaaaaaaaaaaaaand it would appear that i have a touch of food poisoning"
	, "found a new level of being a great hostess on the last night be stricken w violent food poisoning a kind way to say welcome w vomit"
	, "chadwickshake he got food poisoning he was dehydrated and i think he collapsed on stage"
	, "i think i have food poisoning or something i can t even call out from work because i m working alone this isn t going to be good"
	, "chrissielov8141 food poisoning"
	, "wow what the hellll definitely got food poisoning from last night ughhh"
	, "gangstiara oh oops i didnt know about that bc the last thing i heard was food poisoning aw"
	, "the way i feel today has completely ruined sushi for me for a long time screw food poisoning"
	, "my family swears i had a bad hangover the other day and it wasnt food poisoning but im telling you it was i still feel fucked up"
	, "i think subway gave me food poisoning"
	, "maxbrenner gave me food poisoning"
	, "omfg last time i eat ihop think i got food poisoning smfh"
	, "lovely and now i m thinking about the other time i had food poisoning because sunday sashimi and cookies don t work very well"
	, "peontiffany loganhasson stupid food poisoning i could have been the fourth shoe"
	, "i know justin will be alright he s just really sick from food poisoning right now that he has to go to the hospital feel better soon justin"
	, "food poisoning amp still might have to go to work later"
	, "jbperfections a big fuck you to the place that gave justin food poisoning"
	, "i shouldn t have gotten the mall food court food last night my stomach is killin me"
	, "i think i got food poisoning from my favorite mexican spot today wackness"
	, "demilovatoneews yeah you might have food poisoning seems like it"
	, "nothing like food poisoning to help you drop a couple pounds"
	, "poor mama has food poisoning"
	, "saltines and pedialyte for lunch yay food poisoning is a bitch"
	, "jebinakhtar got mother fuckin ass food poisoning"
	, "food poisoning someone make me feel better"
	, "sanamayat he had food poisoning last night"

	, "good to know rt vvitcheryy don t eat at chipotle khammmmx rob_hanvy oneflighthigher i got food poisoning from there"
	, "rogersongbi little bit of food poisoning but i m back up on my feet wordpress 3 8 update down and a couple new plugins today brandin"
	, "spent 100 on dinner last night and ned is sick with food poisoning this morning of course"
	, "what do you eat when you re recovering from food poisoning but you re literally starving hmm goodquestion helpmeimhungry"
	, "food poisoning can t function right"
	, "pretty sure this is food poisoning that s not making me feel better right now but it means i ll be ok tomorrow right right"
	, "i have food poisoning this blows i dont want to look at food let alone go outside right now"
	, "brazilian steakhouses in the hood only mean 1 thing food poisoning"

	];

// *********************
// ****** PROGRAM ******
// *********************

var cleanTweet = function(text) {
    var URL_REGEX = "http://[a-z0-9].[a-z]{2,3}/[a-z0-9]+";
    var NON_ALPHA_NUM_REGEX = "[^\\w]";
    var MULTI_SPACE_REGEX = " +";
    var MENTION_REGEX = "@[^ ]+ ";
    var RT_START = "rt ";

    // lowercase it
    text = text.toLowerCase();

    // replace all links with special token
    // note that all twitter links are t.co
    text = text.replace(new RegExp(URL_REGEX, 'g'), "urlextracted");

    // replace non-letters with spaces
    text = text.replace(new RegExp(NON_ALPHA_NUM_REGEX, 'g'), " ");

    // remove leading and trailing spaces
    text = text.trim();

    // replace multiple spaces next to each other with single space
    text = text.replace(new RegExp(MULTI_SPACE_REGEX, 'g'), " ");

    // remove @ mentions
    text = text.replace(new RegExp(MENTION_REGEX, 'g'), "");

    // remove RT
    if (text.indexOf(RT_START) == 0) {
        text = text.substring(RT_START.length);
    }

    return text;
};

database.runWithConn(function() {

	database.findTweets({}, function(err, tweets) {
		if (err) { proc.bail('Failed to find tweets', err); }

		var trueArray = [];
  		for (var i = 0; i < positiveTweets.length; i++) {
  			trueArray.push(true);
  		}

  		var positiveTweetHash = _.object(_.map(positiveTweets, function(t) { return cleanTweet(t); }), trueArray);

		var tweetsToKeep = _.filter(tweets, function(tweet) {
			return positiveTweetHash[cleanTweet(tweet.text)];
		});

		tweetsToKeep = _.sortBy(tweetsToKeep, function(tweet) {
			return !(tweet.in_reply_to && tweet.in_reply_to.status_id);
		});

		tweetsToKeep = _.first(tweetsToKeep, 50);

		console.log(tweetsToKeep[0]);

		proc.done(_.pluck(tweetsToKeep, 'id'));

	});

});



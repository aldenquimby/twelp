// **************************
// ****** DEPENDENCIES ******
// **************************

var _        = require('underscore');
var fuzzy    = require('fuzzy');
var fs       = require('fs');
var proc     = require('./util/processUtil');
var dmpmod   = require('./util/diff_match_patch');
var dmp      = new dmpmod.diff_match_patch();
var FuzzySet = require('fuzzyset.js');

var getBizNameWordCounts = function(uniqueBizNames, shouldLog) {
	var bizNameWords = uniqueBizNames.join(' ').replace(/[^\w\s]|_/g, '').match(/\S+/g);
	var bizNameWordCount = _.countBy(bizNameWords, function(x){return x;});
	if (shouldLog) {
		var toLog = _.map(_.pairs(bizNameWordCount), function(pair) { return { word : pair[0], score : pair[1] }; });
		toLog = _.sortBy(toLog, function(result) { return result.score; });
		console.log(toLog);
	}

	// remove outliers
	delete bizNameWordCount["Restaurant"];

	return bizNameWordCount;
};

exports.fuzzyMatch = function(bizs, tweets) {

	var uniqueBizNames = _.uniq(_.pluck(bizs, 'name'));
	var bizNameWordCount = getBizNameWordCounts(uniqueBizNames);
	var maxCount = _.max(_.values(bizNameWordCount));
	var avgCount = _.reduce(_.values(bizNameWordCount), function(memo, num){ return memo + num; }, 0) / _.values(bizNameWordCount).length;

	var tweetText = _.pluck(tweets, 'text');

	var scoresByName = {};

	_.each(uniqueBizNames, function(bizName) {

		var scoreByIndex = {};

		var nameParts = bizName.split(' ');

		var requiredParts = _.filter(nameParts, function(part) { 
			return bizNameWordCount[part] < 20; 
		});

		if (requiredParts.length > 0) {

			var bonusParts = _.filter(nameParts, function(part) { 
				return bizNameWordCount[part] >= 20; 
			});

			_.each(bonusParts, function(part) {
				var wordCount = bizNameWordCount[part];
				var results = fuzzy.filter(part, tweetText);

				_.each(results, function(result) {
					var wordScale = 0.5 * (maxCount - wordCount) / maxCount;
					if (!scoreByIndex[result.index]) {
						scoreByIndex[result.index] = { bonus:0, required:[] };
					}
					scoreByIndex[result.index].bonus += result.score * wordScale;
				});
			});

			var REQUIRED_PART_SCORE_CUTOFF = 20;
			var FULL_SCORE_CUTOFF = 200;

			_.each(requiredParts, function(part) {
				var wordCount = bizNameWordCount[part];
				var results = fuzzy.filter(part, tweetText);

				_.each(results, function(result) {
					if (!scoreByIndex[result.index]) {
						scoreByIndex[result.index] = { bonus:0, required:[] };
					}

					if (result.score < REQUIRED_PART_SCORE_CUTOFF) {
						scoreByIndex[result.index].required.push(0);
					}
					else {
						var wordScale = (20 - wordCount) / 20;
						scoreByIndex[result.index].required.push(result.score * wordScale);
					}
				});
			});

			var scoresToKeep = _.filter(_.pairs(scoreByIndex), function(pair) {
				return pair[1].required.length == requiredParts.length
				    && _.all(pair[1].required, function(score) { return score > 0; });
			});

			var tweetScores = _.map(scoresToKeep, function(pair) {
				var score = pair[1].bonus + _.reduce(pair[1].required, function(memo, num){ return memo + num; }, 0);
				return { tweet : tweetText[pair[0]], score : score };
			});

			tweetScores = _.filter(tweetScores, function(score) {
				return score.score > FULL_SCORE_CUTOFF;
			});

			scoresByName[bizName] = tweetScores;

		}

	});

	return scoresByName;
};

return;


var TWEETS_FILE = './private/tweets-20140227T030314518Z.json';
var YELP_BIZ_FILE = './private/yelp_businesses.json';

var tweets = JSON.parse(fs.readFileSync(TWEETS_FILE));
var bizs = JSON.parse(fs.readFileSync(YELP_BIZ_FILE));

var scoresByName = exports.fuzzyMatch(bizs, tweets);

_.each(_.pairs(scoresByName), function(pair) {

	var bizName = pair[0];
	var tweetScores = pair[1];

	if (tweetScores.length > 0) {
		console.log("*********************");
		console.log(bizName + ' (required: ' + requiredParts.join(' ') + ', bonus: ' + bonusParts.join(' ') + ')');
		console.log("*********************");
		console.log(tweetScores);
	}

});

proc.done();

var results = fuzzy.filter('the mid-life crisis', tweetText);

results = _.filter(results, function(r) {
	return r.score > 20;
});

results = _.map(results, function(r) { 
	return _.pick(r, 'string', 'score'); 
});

var results2 = _.map(tweetText, function(t) {
	var score = dmp.match_main(t, "the mid-life crisis", 0);
	return { string: t, score: score };
});

results2 = _.filter(results2, function(r) {
	return r.score > 20;
});

console.log(results2);

var t1 = _.pluck(results, 'string');
var t2 = _.pluck(results2, 'string');

var in1Not2 = _.difference(t1, t2);
var in2Not1 = _.difference(t2, t1);

return;

console.log(in2Not1);



var set = FuzzySet();
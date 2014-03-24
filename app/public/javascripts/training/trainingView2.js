var TrainingView = Backbone.View.extend({

	events : {
		"click .humanLabel" : "label",
		"click .reset" : "reset"
	},

	initialize : function() {
		var self = this;

		self.data = self.options.data;
		self.techniqueIdx = 0;
		self.withScoresIdx = 0;
		self.currTech = null;
		self.currResult = null;

		self.displayNext();
	},

	displayNext : function() {
		var self = this;

		var currTech = self.data[self.techniqueIdx];

		// switch to results view if we're done
		if (!currTech) {
			return window.location.href = '/results.html' + window.location.search;
		}

		self.withScoresIdx = -1;
		_.any(currTech.withScores, function(result, withScoresIdx) {
			if (!result.label) {
				self.withScoresIdx = withScoresIdx;
				return true;
			}
			return false;
		});

		if (self.withScoresIdx < 0) {
			self.techniqueIdx++;
			return self.displayNext();
		}

		self.currTech = self.data[self.techniqueIdx];
		self.currResult = self.currTech.withScores[self.withScoresIdx];

		self.render();
	},

	render : function () {
		var self = this;

		self.$el.html('');

		var technique = self.$el.mustache('technique', self.techToView(self.currTech));

		technique.find('.score').find('dd').mustache('score', _.map(self.currResult.restaurantScores, self.restScoreToView));

		var tweetSetHtml = "";
		_.each(self.currResult.expandedTweetSet, function(tweet) {
			tweetSetHtml += $.Mustache.render('tweet', self.tweetToView(tweet));
		});
		technique.find('.tweet-set').html(tweetSetHtml);
	},

	techToView : function() {
		var self = this;

		var hasMap = false;
		var mapUrl = 'http://maps.google.com/maps/api/staticmap?size=640x640&sensor=false';

		var getMarker = function(color, lat, lon) {
			return '&markers=color:' + color + '|' + lat + ',' + lon;
		};

		// dont add restaurants to map
/*
		_.each(self.currResult.restaurantScores, function(rs) {
			if (rs.loc) {
				hasMap = true;
				mapUrl += getMarker('blue', rs.loc[1], rs.loc[0]);
			}
		});
*/

		_.each(self.currResult.expandedTweetSet, function(tweet) {
			if (tweet.loc) {
				hasMap = true;
				mapUrl += getMarker('red', tweet.loc[1], tweet.loc[0]);
			}
		});

		return {
			user      : self.currResult.tweet.user,
			technique : self.currTech.technique,
			mapUrl    : hasMap ? mapUrl : null
		};
	},

	restScoreToView : function(rs) {
		if (rs.loc) {
			rs.locUrl = 'https://www.google.com/maps/place/' + rs.loc[1] + ',' + rs.loc[0];
			rs.loc = rs.loc[1].toFixed(2) + ', ' + rs.loc[0].toFixed(2);
		}
		return rs;
	},

	tweetToView : function(tweet) {
		var self = this;

		var t = {
			date : moment(tweet.date).format('MMM DD, HH:mm'),
			text : tweet.text,
			user : tweet.user,
			css : _.isEqual(tweet, self.currResult.tweet) ? 'mainTweet' : ''
		};
		
		if (tweet.loc && tweet.loc.length > 0) {
			t.loc = tweet.loc[1].toFixed(2) + ', ' + tweet.loc[0].toFixed(2);
			t.locUrl = 'https://www.google.com/maps/place/' + tweet.loc[1] + ',' + tweet.loc[0];
		}

		return t;
	},

	label : function(e) {
		e.preventDefault();
		var self = this;
		self.saveLabel($(e.currentTarget).data('label'));
	},

	saveLabel : function(label) {
		var self = this;
		self.currResult.label = label;

		var body = {
			label : label,
			techniqueIndex : self.techniqueIdx,
			withScoresIndex : self.withScoresIdx,
			restaurantIds : []
		};

		$.post('/training2' + window.location.search, body, function(data) {
			if (!data.success) {
				return alert('failed!');
			}
			self.displayNext();			
		});
	}
	
});

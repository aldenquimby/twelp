var OtherView = Backbone.View.extend({

	events : {

	},

	initialize : function() {
		var self = this;
		self.data = self.options.data;
		self.render();
	},

	render : function () {
		var self = this;

		self.$el.html('');

		_.each(self.data, function(tech) {
			var tech = tech;
			var technique = self.$el.mustache('technique', tech);

			_.each(tech.withoutScores, function(result) {
				var tweetViews = _.map(_.first(result.expandedTweetSet, 1), self.tweetToView);
				technique.find('.tweet-sets').mustache('tweet-set', {tweets:tweetViews});
			});

		});
	},

	tweetToView : function(tweet) {
		var self = this;

		var t = {
			date : moment(tweet.date).format('MMM DD, HH:mm'),
			text : tweet.text,
			user : tweet.user
		};

		if (tweet.loc && tweet.loc.length > 0) {
			t.loc = tweet.loc[1].toFixed(2) + ', ' + tweet.loc[0].toFixed(2);
			t.locUrl = 'https://www.google.com/maps/place/' + tweet.loc[1] + ',' + tweet.loc[0];
		}

		return t;
	}
	
});

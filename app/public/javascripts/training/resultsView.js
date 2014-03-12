var ResultsView = Backbone.View.extend({

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

		var technique = self.$el.mustache('technique', self.currTech.technique);

		technique.find('.start-tweet').mustache('tweet', self.tweetToView(self.currResult.tweet));
		technique.find('.score').find('dd').mustache('score', self.currResult.restaurantScores);

		var tweetSetHtml = "";
		_.each(self.currResult.expandedTweetSet, function(tweet) {
			tweetSetHtml += $.Mustache.render('tweet', self.tweetToView(tweet));
		});
		technique.find('.tweet-set').html(tweetSetHtml);
	},

});

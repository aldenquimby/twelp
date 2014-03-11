var HumanClassifyView = Backbone.View.extend({

	events : {
		"click .toggle" :"toggleone",
		"click .toggleAll": "toggleAll"
	},

	initialize : function() {
		var self = this;
		self.render();
	},

	toggleone: function (e) {
		e.preventDefault();
		var tog = $(e.currentTarget);
		var deets = tog.siblings('.details').first();
		deets.toggle();
	},

	toggleAll: function (e) {
		e.preventDefault();
		var self = this;
		self.$('.details').toggle();
	},

	render: function () {
		var self = this;

		_.each(data, function(tech) {

			var technique = self.$el.mustache('technique', tech.technique);

			_.each(tech.withScores, function(result) {

				var res = technique.find('.results').mustache('result');

				res.find('.start-tweet').mustache('tweet', result.tweet);
				res.find('.score').mustache('score', result.restaurantScores[0]);

				var tweetSetHtml = "";
				_.each(result.expandedTweetSet, function(tweet) {
					tweetSetHtml += $.Mustache.render('tweet', tweet);
				});
				res.find('.tweet-set').html(tweetSetHtml);

			});

		});
	}
	
});

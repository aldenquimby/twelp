var TrainingView = Backbone.View.extend({

	events : {
		"click .humanLabel" : "label",
		"click .reset" : "reset"
	},

	initialize : function() {
		var self = this;
		self.setup(self.options.data);
	},

	setup : function(data) {
		var self = this;

		self.data = data;
		self.techniqueIdx = 0;
		self.withScoresIdx = 0;
		self.currTech = null;
		self.currResult = null;

		self.displayNext();
	},

	displayNext : function() {
		var self = this;

		self.currTech = self.data[self.techniqueIdx];

		if (!self.currTech) {
			return self.$el.mustache('complete');
		}

		self.currResult = null;
		_.any(self.currTech.withScores, function(result, withScoresIdx) {
			if (!result.label) {
				self.currResult = result;
				self.withScoresIdx = withScoresIdx;
				return true;
			}
			return false;
		});

		if (!self.currResult) {
			self.techniqueIdx++;
			return self.displayNext();
		}

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

	tweetToView : function(tweet) {
		var self = this;
		return {
			date : moment(tweet.date).format('MMM DD, HH:mm'),
			loc  : tweet.loc ? tweet.loc[0].toFixed(3) + ', ' + tweet.loc[1].toFixed(3) : null,
			text : tweet.text,
			user : tweet == self.currResult.tweet ? tweet.user : (tweet.user == self.currResult.tweet.user ? null : tweet.user)
		};
	},

	label : function(e) {
		e.preventDefault();
		var self = this;
		self.saveLabel($(e.currentTarget).data('label'));
	},

	reset : function(e) {
		e.preventDefault();
		var self = this;
		if (confirm('Are you sure you want to reset the labels for this link result?')) {
			$.ajax({
			    url: '/training' + window.location.search,
			    type: 'PUT',
			    success: function(data) {
					if (!data.success) {
						return alert('failed!');
					}
					self.setup(data.data);
			    }
			});
		}
	},

	saveLabel : function(label) {
		var self = this;
		self.currResult.label = label;

		var body = {
			label : label,
			techniqueIndex : self.techniqueIdx,
			withScoresIndex : self.withScoresIdx
		};

		$.post('/training' + window.location.search, body, function(data) {
			if (!data.success) {
				return alert('failed!');
			}
			self.displayNext();			
		});
	}
	
});

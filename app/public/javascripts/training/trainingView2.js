var TrainingView = Backbone.View.extend({

	events : {
		"click .humanLabel" : "label",
		"click .reset" : "reset"
	},

	initialize : function() {
		var self = this;

		self.data = self.options.data;

		self.current = self.data.pop();

		self.render();
	},

	render : function () {
		var self = this;

		self.$el.html('');

		var technique = self.$el.mustache('tweetSet', self.techToView(self.current));

		var tweetSetHtml = "";
		_.each(self.current.tweets, function(tweet) {
			tweetSetHtml += $.Mustache.render('tweet', self.tweetToView(tweet));
		});
		technique.find('.tweet-set').html(tweetSetHtml);
	},

	techToView : function() {
		var self = this;

		var user = '';
		var hasMap = false;
		var mapUrl = 'http://maps.google.com/maps/api/staticmap?size=640x640&sensor=false';

		var getMarker = function(color, lat, lon) {
			return '&markers=color:' + color + '|' + lat + ',' + lon;
		};

		_.each(self.current.tweets, function(tweet) {
			if (tweet.loc && tweet.loc.length > 0) {
				hasMap = true;
				mapUrl += getMarker('red', tweet.loc[1], tweet.loc[0]);
			}
			if (tweet.initial) {
				user = tweet.user;
			}
		});

		return {
			user      : user,
			mapUrl    : hasMap ? mapUrl : null
		};
	},

	tweetToView : function(tweet) {
		var self = this;

		var t = {
			date : moment(tweet.date).format('MMM DD, HH:mm'),
			text : tweet.text,
			user : tweet.user,
			css  : ''
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
		self.current.label = label;

		$.post('/tweetSet', self.current, function(data) {
			if (!data.success) {
				return alert('failed!');
			}
			self.current = self.data.pop();
			self.render();
		});
	},

	reset : function(e) {
		e.preventDefault();
		var self = this;
		if (confirm('Are you sure you want to reset the labels?')) {
			$.ajax({
			    url: '/tweetSet',
			    type: 'PUT',
			    success: function(data) {
					if (!data.success) {
						return alert('failed!');
					}
			    	window.location.reload();
			    }
			});
		}
	}
	
});

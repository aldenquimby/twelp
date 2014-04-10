var OutbreaksView = Backbone.View.extend({

	events : {
		"click .outbreak-card" : "showOutbreak",
		"click .outbreak-back" : "showOutbreakCards"
	},

	initialize : function() {
		var self = this;

		self.outbreaks = outbreaks;

		self.render();
	},

	// ------------------------------------
	// ------------- RENDER ---------------
	// ------------------------------------

	render : function() {
		var self = this;

		self.$el.html('');

		self.$el.mustache('outbreaks', null);

		self.renderOutbreakCards();
	},

	renderOutbreakCards : function() {
		var self = this;

		var cardsHtml = "";
		_.each(self.outbreaks, function(outbreak) {
			cardsHtml += $.Mustache.render('outbreak-card', self.outbreakCardView(outbreak));
		});

		self.$el.find('.outbreak-back').hide();
		self.$el.find('.outbreak-wrapper').html('');
		self.$el.find('.outbreak-cards').html(cardsHtml);
	},

	outbreakCardView : function(outbreak) {
		var countBySource = _.countBy(outbreak.documents, 'source');
		
		return {
			id : outbreak.id,
			date_created : moment(outbreak.date_created).format('MMM DD, hh:mm a'),
			restaurant : outbreak.restaurant,
			yelpCount : countBySource['Yelp'],
			threeOneOneCount : countBySource['311'],
			twitterCount : countBySource['Twitter']
		}
	},

	renderOutbreak : function(outbreakId) {
		var self = this;

		var outbreak = _.find(self.outbreaks, function(outbreak) {
			return outbreak.id == outbreakId;
		});

		self.$el.find('.outbreak-back').show();
		self.$el.find('.outbreak-wrapper').mustache('outbreak', self.outbreakView(outbreak));
		self.$el.find('.outbreak-cards').html('');
	},

	outbreakView : function(outbreak) {
		return outbreak;
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

		return {
			user      : user,
			mapUrl    : hasMap ? mapUrl : null
		};
	},

	// ------------------------------------
	// ------------- EVENTS ---------------
	// ------------------------------------

	showOutbreak : function(e) {
		e.preventDefault();
		var self = this;

		var outbreakId = $(e.currentTarget).data('id');

		self.renderOutbreak(outbreakId);
	},

	showOutbreakCards : function(e) {
		e.preventDefault();
		var self = this;

		self.renderOutbreakCards();
	},

	// ------------------------------------
	// ---------- UTILITIES ---------------
	// ------------------------------------

	getMapUrl : function(coord) {
		return 'https://www.google.com/maps/place/' + coord[1] + ',' + coord[0];
	},

	getMultiMapUrl : function(coordsWithColor) {
		var mapUrl = 'http://maps.google.com/maps/api/staticmap?size=640x640&sensor=false';

		var getMarker = function(color, lat, lon) {
			return '&markers=color:' + color + '|' + lat + ',' + lon;
		};

		_.each(coordsWithColor, function(c) {
			mapUrl += getMarker(c.color, c.coord[1], c.coord[0]);
		});

		return mapUrl;
	}

});

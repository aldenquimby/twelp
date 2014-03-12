var ResultsView = Backbone.View.extend({

	events : {
		"click .reset" : "reset"
	},

	initialize : function() {
		var self = this;
		self.data = self.options.data;
		self.render();
	},

	render : function () {
		var self = this;

		var techResults = _.map(self.data, function(tech) {
			var labelCounts = _.countBy(tech.withScores, 'label');

			var results = _.map(_.pairs(labelCounts), function(pair) {
				return {
					label : pair[0],
					count : pair[1]
				};
			});

			return {
				technique : tech.technique,
				results   : results
			};
		});

		self.$el.mustache('technique', techResults);
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

			    	// switch to training view
			    	window.location.href = '/training.html' + window.location.search;
			    }
			});
		}
	}

});

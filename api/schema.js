var _ = require('underscore');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;

var TweetSchema = new Schema({
	created_at: { type: Date, required: true, index: true },
	id: { type: String, required: true, index: {unique: true, dropDups: true} },
	text: { type: String, required: true },
    user: {
    	id: String,
    	screen_name: String, 
    	name: String, 
    	location: String
    },
    in_reply_to: {
    	screen_name: String,
    	status_id: String,
    	user_id: String
    },
    hashtags: [String],
    symbols: [String],
    urls: [String],
    user_mentions: [{
    	id: String,
    	screen_name: String, 
    	name: String
    }],
    coordinates: { 
    	type: { type: String }, 
    	coordinates: []
    },
    place: {
    	id: String,
    	full_name: String,
    	bounding_box: {
	    	type: { type: String }, 
    		coordinates: []
    	}
    },
    class_label: String,
});

TweetSchema.pre('save', function (next) {
    if(this.coordinates.coordinates.length == 0){
        this.coordinates = undefined;
    }
    if(this.place.bounding_box.coordinates.length == 0){ 
        this.place = undefined;
    }
    next();
});

var ClassifiedTweetSchema = new Schema({
	tweet: { type: ObjectId, required: true },
	label: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
});

exports.createTweetForDb = function(tweet) {
    var in_reply_to = null;
    if (tweet.in_reply_to_status_id) {
        in_reply_to = {
            screen_name: tweet.in_reply_to_screen_name,
            status_id: tweet.in_reply_to_status_id_str,
            user_id: tweet.in_reply_to_user_id_str
        };
    }

    var user = {
        id: tweet.user.id_str,
        screen_name: tweet.user.screen_name, 
        name: tweet.user.name, 
        location: tweet.user.location
    };

    var hashtags = _.pluck(tweet.entities.hashtags, 'text');
    var symbols = _.pluck(tweet.entities.symbols, 'text');
    var urls = _.map(tweet.entities.urls, function(url) {
        return url.expanded_url || url.url;
    });
    var user_mentions = _.map(tweet.entities.user_mentions, function(user_mention) {
        return {
            id: user_mention.id_str,
            screen_name: user_mention.screen_name,
            name: user_mention.name
        };
    });

    var place = null;
    if (tweet.place) {
        place = {
            id: tweet.place.id,
            full_name: tweet.place.full_name,
            bounding_box: tweet.place.bounding_box
        };
    }

    return {
        created_at: tweet.created_at,
        id: tweet.id_str,
        text: tweet.text,
        user: user,
        in_reply_to: in_reply_to,
        hashtags: hashtags,
        symbols: symbols,
        urls: urls,
        user_mentions: user_mentions,
        coordinates: tweet.coordinates,
        place: place,
    };
};

exports.TweetSchema = TweetSchema;
exports.ClassifiedTweetSchema = ClassifiedTweetSchema;

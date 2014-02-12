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
    	type: String, 
    	coordinates: [Number]
    },
    place: {
    	id: String,
    	full_name: String  ,
    	bounding_box: {
	    	type: String, 
    		coordinates: [Number]
    	}
    },
    class_label: String,
    classification: [{
        score: Number,
        classifier: String,
        date: Date
    }],
    tags: [String]
});

TweetSchema.add({
    conversation : [TweetSchema]
});

var YelpBusinessSchema = new Schema({
    created_at: { type: Date, required: true  },
    id: { type: String, required: true, index: {unique: true, dropDups: true} },
    url: { type: String },
    site: String,
    twitter: String
});

exports.createTweetForDb = function(tweet) {
   
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

    var place = undefined;
    if (tweet.place && tweet.place.bounding_box.coordinates.length > 0) {
        place = {
            id: tweet.place.id,
            full_name: tweet.place.full_name,
            bounding_box: tweet.place.bounding_box
        };
    }

    var coordinates = undefined;
    if (tweet.coordinates && tweet.coordinates.coordinates.length > 0) {
        coordinates = tweet.coordinates;
    }
 
    var in_reply_to = undefined;
    if (tweet.in_reply_to_status_id) {
        in_reply_to = {
            screen_name: tweet.in_reply_to_screen_name,
            status_id: tweet.in_reply_to_status_id_str,
            user_id: tweet.in_reply_to_user_id_str
        };
    }

    // deal with any special twitter text encodings here
    var cleanText = tweet.text
                         .replace("&amp;", "&");

    return {
        created_at: tweet.created_at,
        id: tweet.id_str,
        text: cleanText,
        user: user,
        in_reply_to: in_reply_to,
        hashtags: hashtags,
        symbols: symbols,
        urls: urls,
        user_mentions: user_mentions,
        coordinates: coordinates,
        place: place,
        conversation: undefined,
        tags: undefined
    };
};

exports.TweetSchema = TweetSchema;
exports.YelpBusinessSchema = YelpBusinessSchema;


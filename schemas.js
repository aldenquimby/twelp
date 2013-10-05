var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.Schema.ObjectId;

var CommentSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    body: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        index: true,
        validate: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}\b/
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    object: {
        type: String,
        default: 'comment'
    }
});

var PostSchema = new Schema({
    author: {
        type: String,
        required: true,
        trim: true
    }, 
    title: {
        type: String,
        required: true,
        trim: true
    }, 
    body: {
        type: String,
        required: true,
        trim: true
    }, 
    comments: [CommentSchema], 
    meta: {
        votes: Number, 
        favs: Number
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    },
    object: {
        type: String,
        default: 'post'
    }
});

exports.comment = mongoose.model('comment', CommentSchema);
exports.post = mongoose.model('post', PostSchema);

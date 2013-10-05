var frisby = require('frisby');

var URL = 'http://localhost:5115/';

frisby.globalSetup({
  request: {
    headers: { 'X-Auth-Token': 'fa8426a0-8eaf-4d22-8e13-7c1b16a9370c' }
  }
});

frisby.create('Get all blogs')
  .get(URL + 'blogs')
  .expectStatus(200)
  .expectHeader('content-type', 'application/json')
  .expectJSONTypes('*', {
    _id: String,
    title: String,
    author: String,
    body: String,
    date: String,
    comments: Array
  })
  .expectJSON('?', {
    _id: '5218e33c987b3f685a000003',
    title: 'Whats up doc',
    author: 'Walt Disney'
  })
.toss();

frisby.create('Get blog by id')
  .get(URL + 'blogs/5218e33c987b3f685a000003')
  .expectStatus(200)
  .expectHeader('content-type', 'application/json')
  .expectJSON({
    _id: '5218e33c987b3f685a000003',
    title: 'Whats up doc',
    author: 'Walt Disney'
  })
.toss();

frisby.create('Create blog')
  .post(URL + 'blogs', {
    author: 'Alden',
    title: 'Cool',
    body: 'My blog post.'
  })
  .expectStatus(201)
  .expectHeader('content-type', 'application/json')
  .expectJSONTypes({
    _id: String,
    date: String,
  })
  .expectJSON({
    author: 'Alden',
    title: 'Cool',
    body: 'My blog post.'      
  })
  .afterJSON(function(blog) {

    var newId = blog._id;

    frisby.create('Update blog')
      .put(URL + 'blogs/' + newId, {
        author: 'Katie',
        title: 'Awesome'
      })
      .expectStatus(200)
      .expectHeader('content-type', 'application/json')
      .expectJSON({
        _id: newId,
        author: 'Katie',
        title: 'Awesome'        
      })
    .toss();

    frisby.create('Delete blog')
      .delete(URL + 'blogs/' + newId)
      .expectStatus(200)
    .toss();

  })
.toss();

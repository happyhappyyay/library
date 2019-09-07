/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology:true},(err, client)=>{
        var db = client.db("library");
        db.collection("library").find().toArray((err,books)=>{
          if(!err) {
            for(var i = 0; i < books.length; i++){
              books[i].commentcount = books[i].comments.length;
              delete books[i].comments;
            }
            res.json(books);
          }
        })
      });
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
    })
    
    .post(function (req, res){
      var title = req.body.title;
      if(title){
        var book = {
          "_id":new ObjectId(),
          "title":title,
          "comments":[]
        };
        MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology:true},(err, client)=>{
          var db = client.db("library");
          db.collection("library").insertOne(book,(err, book)=>{
            if(!err){
            res.send(book.ops);
            }
          })
        })
      }
      else {
        res.send("Please include the book title")
      }

      //response will contain new book object including atleast _id and title
    })
    
    .delete(function(req, res){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology:true},(err, client)=>{
        var db = client.db("library");
        db.collection("library").deleteMany({},(err)=>{
          if(!err) res.send("complete delete successful");
        })
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      if(ObjectId(bookid) != null){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology:true},(err, client)=>{
        var db = client.db("library");
        db.collection("library").findOne({_id:ObjectId(bookid)}, (err,book)=>{
          if(err | !book){
            res.send("could not find book");
          }
          else {
            res.send(book);
          }
        })
      });
      }
      else {
        res.send("Please enter a bookid")
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      if(bookid != null & comment != null){
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology:true},(err, client)=>{
        var db = client.db("library");
        db.collection("library").findOneAndUpdate({_id:ObjectId(bookid)}, {$push: { comments: comment } }, {returnOriginal:false}, (err,book)=>{
          if(!err)res.send(book.value);
        })
      });
    }
    else {
      res.send("please complete the required fields");
    }
      //json res format same as .get
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      MongoClient.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true, useUnifiedTopology:true},(err, client)=>{
        var db = client.db("library");
        db.collection("library").findOneAndDelete({_id:ObjectId(bookid)},err =>{
          if(!err) res.send("delete successful");
        });
      });
      //if successful response will be 'delete successful'
    });
  
};

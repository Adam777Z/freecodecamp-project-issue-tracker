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
var ObjectId = require('mongodb').ObjectID;

module.exports = function(app) {
  
  app.route('/api/issues/:project')
  .get(function(req, res) {
    var project = req.params.project;
    
    // let searchQuery = { req.query };
    let searchQuery = { project };
    
    if (req.query._id !== undefined) { searchQuery['_id'] = new ObjectId(req.query._id); }
    
    if (req.query.issue_title !== undefined) { searchQuery['issue_title'] = req.query.issue_title; }
    
    if (req.query.issue_text !== undefined) { searchQuery['issue_text'] = req.query.issue_text; }
    
    if (req.query.created_by !== undefined) { searchQuery['created_by'] = req.query.created_by; }
    
    if (req.query.assigned_to !== undefined) { searchQuery['assigned_to'] = req.query.assigned_to; }
    
    if (req.query.status_text !== undefined) { searchQuery['status_text'] = req.query.status_text; }
    
    if (req.query.created_on !== undefined) { searchQuery['created_on'] = new Date(req.query.created_on); }
    
    if (req.query.updated_on !== undefined) { searchQuery['updated_on'] = new Date(req.query.updated_on); }
    
    if (req.query.open !== undefined && req.query.open === 'true') {
      searchQuery['open'] = true;
    } else if (req.query.open !== undefined && req.query.open === 'false') {
      searchQuery['open'] = false;
    }
    
    MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
      if (err) {
        // console.log('Database error: ' + err);
        return res.json({ error: 'error' });
      } else {
        db.db().collection('issuetracker').find(searchQuery).toArray(function(err, docs) {
          return res.json(docs);
        });
      }
    });
  })
  .post(function(req, res) {
    if (req.body.issue_title === undefined || req.body.issue_title === '') {
      return res.json({ error: 'Title is required' });
    }
    
    if (req.body.issue_text === undefined || req.body.issue_text === '') {
      return res.json({ error: 'Text is required' });
    }
    
    if (req.body.created_by === undefined || req.body.created_by === '') {
      return res.json({ error: 'Created by is required' });
    }
    
    var project = req.params.project;
    let issue_title = req.body.issue_title;
    let issue_text = req.body.issue_text;
    let created_by = req.body.created_by;
    let assigned_to = (req.body.assigned_to !== undefined ? req.body.assigned_to : '');
    let status_text = (req.body.status_text !== undefined ? req.body.status_text : '');
    
    let date = new Date();
    
    MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
      if (err) {
        // console.log('Database error: ' + err);
        return res.json({ error: 'error' });
      } else {
        db.db().collection('issuetracker').insertOne(
          {
            project: project,
            issue_title: issue_title,
            issue_text: issue_text,
            created_by: created_by,
            assigned_to: assigned_to,
            status_text: status_text,
            created_on: date,
            updated_on: date,
            open: true
          }, function(err, doc) {
            return res.json(doc['ops'][0]);
          }
        );
      }
    });
  })
  .put(function(req, res) {
    if (req.body._id === undefined || req.body._id === '') {
      return res.json({ error: '_id is required' });
    }
    
    if (req.body.issue_title === undefined && req.body.issue_text === undefined && req.body.created_by === undefined && req.body.assigned_to === undefined && req.body.status_text === undefined && req.body.open === undefined) {
      return res.json({ error: 'no update field sent' });
    }
    
    var project = req.params.project;
    let _id = req.body._id;
    
    let issue_title = (req.body.issue_title !== undefined ? req.body.issue_title : '');
    let issue_text = (req.body.issue_text !== undefined ? req.body.issue_text : '');
    let created_by = (req.body.created_by !== undefined ? req.body.created_by : '');
    let assigned_to = (req.body.assigned_to !== undefined ? req.body.assigned_to : '');
    let status_text = (req.body.status_text !== undefined ? req.body.status_text : '');
    let open = (req.body.open === undefined ? true : false);
    
    let date = new Date();
    
    MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
      if (err) {
        // console.log('Database error: ' + err);
        return res.json({ error: 'error' });
      } else {
        db.db().collection('issuetracker').findOneAndUpdate(
          {
            project: project,
            _id: new ObjectId(_id)
          },
          { $set: {
              issue_title: issue_title,
              issue_text: issue_text,
              created_by: created_by,
              assigned_to: assigned_to,
              status_text: status_text,
              updated_on: date,
              open: open
            }
          },
          { returnOriginal: false }, // Return updated object after modify
          function(error, result) {
            if (result.ok === 1 && result.value !== null) {
              return res.json('successfully updated');
            } else {
              return res.json('could not update ' + _id);
            }
            // return res.json(result.value);
          }
        );
      }
    });
  })
  .delete(function(req, res) {
    var project = req.params.project;
    
    if (req.body._id === undefined || req.body._id === '') {
      return res.json({ error: '_id error' });
    }
    
    let _id = req.body._id;
    
    MongoClient.connect(process.env.DATABASE, { useNewUrlParser: true }, function(err, db) {
      if (err) {
        // console.log('Database error: ' + err);
        return res.json({ error: 'error' });
      } else {
        db.db().collection('issuetracker').findOneAndDelete(
          {
            project: project,
            _id: new ObjectId(_id)
          },
          function(error, result) {
            if (result.ok === 1 && result.value !== null) {
              return res.json('deleted ' + _id);
            } else {
              return res.json('could not delete ' + _id);
            }
            // return res.json(result.value);
          }
        );
      }
    });
  });
  
};

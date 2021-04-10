const path = require('path');
const AWS = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const File = require('../models/file');
const Router = express.Router();

AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    acl: "public-read",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString());
    },
  }),
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, or png format.'
        )
      );
    }
    cb(undefined, true);
  }
});

// @route POST file/save
// @desc Save file
// @access Public
Router.post(
  '/save',
  upload.single('file'),
  async (req, res) => {
    try {
      const { description, userId } = req.body;
      console.log('req.body:', req.body);
      const fileUrl = req.file.location;
      const file = new File({
        description,
        file_url: fileUrl,
        created_by: userId
      });
      await file.save();
      res.send('file saved successfully.');
    } catch (error) {
      res.status(500).send('Error while saving file. Try again later.');
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

// @route POST file/edit
// @desc Update file
// @access Public
Router.post(
  '/update/:id',
  upload.single('file'),
  async (req, res) => {
    try {
      const file = await File.findById(req.params.id);
      const { description } = req.body;
      if (req.file) {
        const fileUrl = req.file.location;
        file.file_url = fileUrl;
      }
      file.description = description;
      await file.save();
      res.send('file updated successfully.');
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

// @route GET file/getFile/:id
// @desc Get one file
// @access Public
Router.get('/getFile/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    res.send(file);
  } catch (error) {
    res.status(500).send('Error while getting file. Try again later.');
  }
});

// @route GET file/getAllFiles
// @desc Get all files
// @access Public
Router.get('/getAllFiles/:id', async (req, res) => {
  try {
    const files = await File.find({ created_by: req.params.id });
    const sortedByCreationDate = files.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(500).send('Error while getting list of files. Try again later.');
  }
});

// @route DELETE file/delete/:id
// @desc Delete single file
// @access Public
Router.delete('/delete/:id', async (req, res) => {
  try {
    await File.findByIdAndDelete(req.params.id);
    res.send('file deleted successfully.');
  } catch (error) {
    res.status(400).send('Error while deleting file. Try again later.');
  }
});

module.exports = Router;

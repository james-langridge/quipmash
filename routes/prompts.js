// const path = require('path');
const AWS = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Prompt = require('../models/prompt');
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

// @route POST prompt/save
// @desc Save prompt
// @access Public
Router.post(
  '/upload',
  upload.single('prompt'),
  async (req, res) => {
    try {
      const { question, userId } = req.body;
      const imageUrl = req.image.location;
      const prompt = new Prompt({
        question,
        image_url: imageUrl,
        created_by: userId
      });
      await prompt.save();
      res.send('prompt saved successfully.');
    } catch (error) {
      res.status(500).send('Error while saving prompt. Try again later.');
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

// @route POST prompt/edit
// @desc Update prompt
// @access Public
Router.post(
  '/update/:id',
  upload.single('prompt'),
  async (req, res) => {
    try {
      const prompt = await Prompt.findById(req.params.id);
      const { question } = req.body;
      if (req.image) {
        const imageUrl = req.image.location;
        prompt.image_url = imageUrl;
      }
      prompt.question = question;
      await prompt.save();
      res.send('prompt updated successfully.');
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

// @route GET prompt/getPrompt/:id
// @desc Get one prompt
// @access Public
Router.get('/getPrompt/:id', async (req, res) => {
  try {
    const prompt = await Prompt.findById(req.params.id);
    res.send(prompt);
  } catch (error) {
    res.status(500).send('Error while getting prompt. Try again later.');
  }
});

// @route GET prompt/getAllPrompts
// @desc Get all prompts
// @access Public
Router.get('/getAllPrompts/:id', async (req, res) => {
  try {
    const prompts = await Prompts.find({ created_by: req.params.id });
    const sortedByCreationDate = prompts.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(500).send('Error while getting list of prompts. Try again later.');
  }
});

// @route DELETE prompt/delete/:id
// @desc Delete single prompt
// @access Public
Router.delete('/delete/:id', async (req, res) => {
  try {
    await Prompt.findByIdAndDelete(req.params.id);
    res.send('prompt deleted successfully.');
  } catch (error) {
    res.status(400).send('Error while deleting prompt. Try again later.');
  }
});

module.exports = Router;

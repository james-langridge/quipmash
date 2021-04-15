const path = require('path');
const express = require('express');
const Prompt = require('../models/prompt');
const Router = express.Router();

// @route POST prompt/save
// @desc Save prompt
// @access Public
Router.post(
  '/save',
  async (req, res) => {
    try {
      const { question, created_by } = req.body;
      const prompt = new Prompt({
        question,
        created_by
      });
      await prompt.save();
      res.send('prompt saved successfully.');
    } catch (error) {
      res.status(500).send(error);
    }
  },
  (error, req, res, next) => {
    if (error) {
      res.status(500).send(error.message);
    }
  }
);

// @route POST prompts/edit
// @desc Update prompt
// @access Public
Router.post(
  '/update/:id',
  async (req, res) => {
    try {
      const prompt = await Prompt.findById(req.params.id);
      const { question } = req.body;
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

// @route GET prompts/getPrompt/:id
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
    const prompts = await Prompt.find({ created_by: req.params.id });
    const sortedByCreationDate = prompts.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route DELETE prompt/delete
// @desc Delete prompts
// @access Public
Router.delete('/delete', async (req, res) => {
  const { selected: ids } = req.body;
  try {
    await Prompt.deleteMany({ _id: ids });
    res.send('deleted successfully.');
  } catch (error) {
    res.status(400).send('Error while deleting. Try again later.');
  }
});

module.exports = Router;

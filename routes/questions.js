const path = require('path');
const express = require('express');
const Question = require('../models/question');
const Router = express.Router();

// @route POST question/save
// @desc Save question
// @access Public
Router.post(
  '/save',
  async (req, res) => {
    try {
      const { question, created_by } = req.body;
      const newQuestion = new Question({
        question,
        created_by
      });
      await newQuestion.save();
      res.send('question saved successfully.');
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

// @route GET question/getAllQuestions
// @desc Get all questions
// @access Public
Router.get('/getAllQuestions/:id', async (req, res) => {
  try {
    const questions = await Question.find({ created_by: req.params.id });
    const sortedByCreationDate = questions.sort(
      (a, b) => b.createdAt - a.createdAt
    );
    res.send(sortedByCreationDate);
  } catch (error) {
    res.status(500).send(error);
  }
});

// @route DELETE question/delete
// @desc Delete questions
// @access Public
Router.delete('/delete', async (req, res) => {
  const { selected: ids } = req.body;
  try {
    await Question.deleteMany({ _id: ids });
    res.send('deleted successfully.');
  } catch (error) {
    res.status(400).send('Error while deleting. Try again later.');
  }
});

module.exports = Router;

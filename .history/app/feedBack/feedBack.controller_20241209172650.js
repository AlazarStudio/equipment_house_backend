import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Private
export const get_Feedbacks = asyncHandler(async (req, res) => {
  const feedbacks = await prisma.feedBack.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  res.json(feedbacks);
});

// @desc    Get a single feedback
// @route   GET /api/feedbacks/:id
// @access  Private
export const get_Feedback = asyncHandler(async (req, res) => {
  const feedback = await prisma.feedBack.findUnique({
    where: { id: +req.params.id },
  });

  if (!feedback) {
    res.status(404);
    throw new Error('FeedBack not found!');
  }

  res.json(feedback);
});

// @desc    Create a new feedback
// @route   POST /api/feedbacks
// @access  Private
export const createFeedback = asyncHandler(async (req, res) => {
  const { comment, phone } = req.body;

  if (!comment || !phone) {
    res.status(400);
    throw new Error('Missing comment or phone!');
  }

  const feedback = await prisma.feedBack.create({
    data: {
      comment,
      phone,
      userId: req.user.id, // Assuming userId is fetched from the request via authentication
    },
  });

  res.status(201).json(feedback);
});

// @desc    Delete a feedback
// @route   DELETE /api/feedbacks/:id
// @access  Private
export const deleteFeedback = asyncHandler(async (req, res) => {
  const feedback = await prisma.feedBack.delete({
    where: {
      id: +req.params.id,
    },
  });

  if (!feedback) {
    res.status(404);
    throw new Error('FeedBack not found!');
  }

  res.json({ message: 'Feedback deleted!' });
});

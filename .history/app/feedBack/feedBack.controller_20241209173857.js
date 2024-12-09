import asyncHandler from 'express-async-handler';
import { prisma } from '../prisma.js';

// @desc    Get all feedbacks
// @route   GET /api/feedbacks
// @access  Private
export const getFeedbacks = asyncHandler(async (req, res) => {
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
export const getFeedback = asyncHandler(async (req, res) => {
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
  const { comment, phone, userId } = req.body;

  if (!comment || !phone || !userId) {
    console.error('Missing fields:', { comment, phone, userId });
    res.status(400);
    throw new Error('Missing comment, phone, or userId!');
  }

  try {
    const feedback = await prisma.feedBack.create({
      data: {
        comment,
        phone,
        userId, // Сохраняем userId в базе данных
      },
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res
      .status(500)
      .json({ message: 'Internal Server Error', error: error.message });
  }
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

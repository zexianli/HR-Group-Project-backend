import OPTDocument from '../models/OPTDocument.js';

export const seedOptDocuments = async (users) => {
  try {
    await OPTDocument.deleteMany({});

    const optComplete = users.find((u) => u.username === 'opt_complete');
    const optMidflow = users.find((u) => u.username === 'opt_midflow');
    const optRejected = users.find((u) => u.username === 'opt_rejected');
    const optStarter = users.find((u) => u.username === 'opt_starter');

    if (!optComplete || !optMidflow || !optRejected || !optStarter) {
      throw new Error('One or more OPT users not found');
    }

    await OPTDocument.insertMany([
      // ============================================
      // Employee 1: Complete flow - All documents APPROVED
      // ============================================
      {
        userId: optComplete._id,
        documentType: 'OPT_RECEIPT',
        documentKey: 'test/OPT_RECEIPT.pdf',
        status: 'APPROVED',
        feedback: null,
      },
      {
        userId: optComplete._id,
        documentType: 'OPT_EAD',
        documentKey: 'test/OPT_EAD.pdf',
        status: 'APPROVED',
        feedback: null,
      },
      {
        userId: optComplete._id,
        documentType: 'I_983',
        documentKey: 'test/I-983.pdf',
        status: 'APPROVED',
        feedback: null,
      },
      {
        userId: optComplete._id,
        documentType: 'I_20',
        documentKey: 'test/I-20.pdf',
        status: 'APPROVED',
        feedback: null,
      },

      // ============================================
      // Employee 2: Mid-flow - OPT_RECEIPT approved, OPT_EAD pending, rest not uploaded
      // ============================================
      {
        userId: optMidflow._id,
        documentType: 'OPT_RECEIPT',
        documentKey: 'test/OPT_RECEIPT.pdf',
        status: 'APPROVED',
        feedback: null,
      },
      {
        userId: optMidflow._id,
        documentType: 'OPT_EAD',
        documentKey: 'test/OPT_EAD.pdf',
        status: 'PENDING',
        feedback: null,
      },

      // ============================================
      // Employee 3: Has rejected document - OPT_EAD was rejected
      // ============================================
      {
        userId: optRejected._id,
        documentType: 'OPT_RECEIPT',
        documentKey: 'test/OPT_RECEIPT.pdf',
        status: 'APPROVED',
        feedback: null,
      },
      {
        userId: optRejected._id,
        documentType: 'OPT_EAD',
        documentKey: 'test/OPT_EAD.pdf',
        status: 'REJECTED',
        feedback: 'This is feedback from HR.',
      },

      // ============================================
      // Employee 4: Just started - Only OPT_RECEIPT uploaded and pending
      // ============================================
      {
        userId: optStarter._id,
        documentType: 'OPT_RECEIPT',
        documentKey: 'test/OPT_RECEIPT.pdf',
        status: 'PENDING',
        feedback: null,
      },
    ]);

    console.log('OPT documents seeded successfully');
  } catch (err) {
    console.error('Error seeding OPT documents:', err);
    throw err;
  }
};

import { requireAuth } from '@/lib/api-auth';
import Test from '@/lib/models/Test';
import Submission from '@/lib/models/Submission';
import ArchivedTest from '@/lib/models/ArchivedTest';

// Get single test
export async function GET(request, { params }) {
  try {
    const { response } = await requireAuth();

    if (response) {
      return response;
    }

    const { id } = await params;
    const test = await Test.findById(id).populate('teacherId', 'name email');

    if (!test) {
      return new Response(JSON.stringify({ message: 'Test not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ test }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Update test (teacher)
export async function PATCH(request, { params }) {
  try {
    const { user, response } = await requireAuth(['teacher']);

    if (response) {
      return response;
    }

    const { id } = await params;
    const test = await Test.findById(id);

    if (!test) {
      return new Response(JSON.stringify({ message: 'Test not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (test.teacherId.toString() !== user._id.toString()) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { title, description, duration, questions, isPublished, passingMarks, negativeMarkingPercent } =
      await request.json();

    if (title) test.title = title;
    if (description) test.description = description;
    if (duration) test.duration = duration;
    if (questions) {
      test.questions = questions;
      test.totalMarks = questions.length * 10;
    }
    if (passingMarks !== undefined) test.passingMarks = passingMarks;
    if (negativeMarkingPercent !== undefined) {
      const parsedNegativeMarking = Number(negativeMarkingPercent || 0);
      test.negativeMarkingPercent =
        parsedNegativeMarking > 0 && parsedNegativeMarking <= 1
          ? parsedNegativeMarking * 100
          : Math.max(0, parsedNegativeMarking);
    }
    if (isPublished !== undefined) test.isPublished = isPublished;

    await test.save();

    return new Response(
      JSON.stringify({
        message: 'Test updated successfully',
        test,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Delete test (teacher)
export async function DELETE(request, { params }) {
  try {
    const { user, response } = await requireAuth(['teacher']);

    if (response) {
      return response;
    }

    const { id } = await params;
    const test = await Test.findById(id);

    if (!test) {
      return new Response(JSON.stringify({ message: 'Test not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (test.teacherId.toString() !== user._id.toString()) {
      return new Response(JSON.stringify({ message: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Gather submissions for this test and build archived stats
    const submissions = await Submission.find({ testId: id }).populate('studentId', 'name email');

    // Build per-question stats based on test.questions length
    const questionCount = test.questions?.length || 0;
    const questionStats = Array.from({ length: questionCount }, (_, i) => ({
      questionIndex: i,
      totalAttempts: 0,
      correctCount: 0,
    }));

    const studentResults = submissions.map((s) => {
      // count per-question stats
      (s.answers || []).forEach((ans) => {
        const qi = parseInt(ans.questionId, 10);
        if (!Number.isNaN(qi) && questionStats[qi]) {
          questionStats[qi].totalAttempts += 1;
          if (ans.isCorrect) questionStats[qi].correctCount += 1;
        }
      });

      return {
        studentId: s.studentId?._id || s.studentId,
        name: s.studentId?.name || undefined,
        email: s.studentId?.email || undefined,
        score: s.score,
        totalMarks: s.totalMarks,
        percentage: s.percentage,
        passed: s.score >= (test.passingMarks || (test.totalMarks * 40) / 100),
        submittedAt: s.submittedAt,
        timeTaken: s.timeTaken,
      };
    });

    // Save archive document
    try {
      const archived = new ArchivedTest({
        originalTestId: test._id,
        title: test.title,
        teacherId: test.teacherId,
        questionCount,
        passingMarks: test.passingMarks || (test.totalMarks * 40) / 100,
        questionStats,
        studentResults,
      });

      await archived.save();
    } catch (err) {
      // If archiving fails, log but continue with deletion to avoid leaving stale tests
      console.error('Failed to archive test results:', err);
    }

    // Delete submissions/answers and then the test itself
    await Submission.deleteMany({ testId: id });
    await Test.deleteOne({ _id: id });

    return new Response(JSON.stringify({ message: 'Test deleted and stats archived successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

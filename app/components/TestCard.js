'use client';

export default function TestCard({ 
  test, 
  onStart, 
  onEdit, 
  onDelete, 
  onPublish, 
  onAssign,
  isAlreadyTaken
}) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-800 bg-slate-900/78 p-5 shadow-xl shadow-black/15 transition-colors hover:border-sky-500/50">
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-base font-bold leading-6 text-slate-100">{test.title}</h3>
        <div className="flex flex-wrap justify-end gap-2">
          {isAlreadyTaken && (
            <span className="rounded-full bg-indigo-400/12 px-2.5 py-1 text-xs font-bold text-indigo-200">
              Already Taken
            </span>
          )}
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
            test.isPublished 
              ? 'bg-emerald-400/12 text-emerald-200' 
              : 'bg-amber-400/12 text-amber-100'
          }`}>
            {test.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
      <p className="mb-5 min-h-10 text-sm leading-6 text-slate-400">{test.description || 'No description added yet.'}</p>

      <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-md bg-slate-950/55 p-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Duration</span>
          <p className="font-bold text-slate-100">{test.duration} min</p>
        </div>
        <div className="rounded-md bg-slate-950/55 p-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Questions</span>
          <p className="font-bold text-slate-100">{test.questions?.length || 0}</p>
        </div>
        <div className="rounded-md bg-slate-950/55 p-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Marks</span>
          <p className="font-bold text-slate-100">{test.totalMarks}</p>
        </div>
        <div className="rounded-md bg-slate-950/55 p-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Assigned</span>
          <p className="font-bold text-slate-100">{test.assignedStudents?.length || 0}</p>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
          {onStart && (
            <button
              onClick={() => onStart(test._id)}
              disabled={isAlreadyTaken}
              className={`min-h-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-ring ${
                isAlreadyTaken
                  ? 'cursor-not-allowed bg-slate-800 text-slate-500'
                  : 'bg-sky-400 text-slate-950 hover:bg-sky-300'
              }`}
            >
              {isAlreadyTaken ? 'Already Taken' : 'Start Test'}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(test._id)}
              className="min-h-10 flex-1 rounded-md border border-slate-700 bg-slate-950/55 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 focus-ring"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(test._id)}
              className="min-h-10 flex-1 rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-400 focus-ring"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          {onPublish && (
            <button
              onClick={() => onPublish(test._id)}
              className={`min-h-10 flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-ring ${
                test.isPublished
                  ? 'border border-slate-700 bg-slate-950/55 text-slate-200 hover:bg-slate-800'
                  : 'bg-teal-400 text-slate-100 hover:bg-teal-300'
              }`}
            >
              {test.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          )}
          {onAssign && (
            <button
              onClick={() => onAssign(test._id)}
              className="min-h-10 flex-1 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-white focus-ring"
            >
              Assign
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

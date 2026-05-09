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
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-white">{test.title}</h3>
        <div className="flex gap-2">
          {isAlreadyTaken && (
            <span className="text-xs px-2 py-1 rounded bg-purple-900 text-purple-200">
              Already Taken
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded ${
            test.isPublished 
              ? 'bg-green-900 text-green-200' 
              : 'bg-yellow-900 text-yellow-200'
          }`}>
            {test.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-4">{test.description || 'No description'}</p>

      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Duration:</span>
          <p className="text-white font-semibold">{test.duration} min</p>
        </div>
        <div>
          <span className="text-gray-500">Questions:</span>
          <p className="text-white font-semibold">{test.questions?.length || 0}</p>
        </div>
        <div>
          <span className="text-gray-500">Total Marks:</span>
          <p className="text-white font-semibold">{test.totalMarks}</p>
        </div>
        <div>
          <span className="text-gray-500">Assigned to:</span>
          <p className="text-white font-semibold">{test.assignedStudents?.length || 0}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          {onStart && (
            <button
              onClick={() => onStart(test._id)}
              disabled={isAlreadyTaken}
              className={`flex-1 py-2 rounded-lg transition-colors text-sm ${
                isAlreadyTaken
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isAlreadyTaken ? 'Already Taken' : 'Start Test'}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(test._id)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition-colors text-sm"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(test._id)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm"
            >
              Delete
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {onPublish && (
            <button
              onClick={() => onPublish(test._id)}
              className={`flex-1 py-2 rounded-lg transition-colors text-sm font-semibold ${
                test.isPublished
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {test.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          )}
          {onAssign && (
            <button
              onClick={() => onAssign(test._id)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition-colors text-sm font-semibold"
            >
              Assign
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

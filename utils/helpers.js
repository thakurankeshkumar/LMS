export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  return `${minutes}m ${secs}s`;
}

export function timeToSeconds(hours, minutes) {
  return hours * 3600 + minutes * 60;
}

export async function fetchAPI(endpoint, options = {}) {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const url = `${baseURL}/api${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }

  return data;
}

export function calculateTestScore(answers, questions) {
  let score = 0;
  answers.forEach((answer, index) => {
    if (answer.selectedOption === questions[index].correctAnswer) {
      score += 10;
    }
  });
  return score;
}

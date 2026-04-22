export function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function getCategoryList(questions) {
  return [...new Set(questions.map((item) => item.category))];
}

export function getQuestionCountsByCategory(questions) {
  return questions.reduce((acc, question) => {
    acc[question.category] = (acc[question.category] || 0) + 1;
    return acc;
  }, {});
}

export function buildQuizQuestions(allQuestions, category, amount) {
  const filtered =
    category === "Toate"
      ? allQuestions
      : allQuestions.filter((item) => item.category === category);

  const shuffled = shuffleArray(filtered);

  if (amount === "all") {
    return shuffled;
  }

  return shuffled.slice(0, Number(amount));
}
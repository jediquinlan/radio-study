import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Question, POOL_LABELS, PoolId, buildPracticeExam, shuffleAnswerOrder } from './questions';

const ANSWER_LETTERS = ['A', 'B', 'C', 'D'];

function buildHtml(questions: Question[], pool: PoolId): string {
  const title = `${POOL_LABELS[pool]} Class Practice Exam`;
  const date = new Date().toLocaleDateString();

  const questionsHtml = questions
    .map((q, i) => {
      const order = shuffleAnswerOrder(q);
      const answersHtml = order
        .map(
          (idx, j) =>
            `<div class="answer">${ANSWER_LETTERS[j]}. ${q.answers[idx]}</div>`
        )
        .join('');

      return `
        <div class="question">
          <div class="q-header">${i + 1}. [${q.id}] ${q.question}</div>
          <div class="answers">${answersHtml}</div>
        </div>`;
    })
    .join('');

  const answerKeyHtml = questions
    .map((q, i) => {
      const order = shuffleAnswerOrder(q);
      const correctLetter = ANSWER_LETTERS[order.indexOf(q.correct)];
      return `${i + 1}. ${correctLetter}`;
    })
    .join('&nbsp;&nbsp;&nbsp;');

  return `
    <html>
    <head>
      <style>
        body { font-family: serif; font-size: 12pt; margin: 40px; }
        h1 { font-size: 18pt; text-align: center; margin-bottom: 4px; }
        .date { text-align: center; color: #777; margin-bottom: 24px; }
        .name-line { margin-bottom: 24px; font-size: 14pt; }
        .name-line span { border-bottom: 1px solid #333; display: inline-block; width: 300px; }
        .question { margin-bottom: 16px; page-break-inside: avoid; }
        .q-header { font-weight: bold; margin-bottom: 4px; }
        .answers { margin-left: 20px; }
        .answer { margin-bottom: 2px; }
        .answer-key { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 10pt; color: #555; }
        .answer-key h3 { font-size: 12pt; }
        .page-break { page-break-before: always; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="date">${date}</div>
      <div class="name-line">Name: <span>&nbsp;</span></div>
      ${questionsHtml}
      <div class="answer-key page-break">
        <h3>Answer Key</h3>
        <p>${answerKeyHtml}</p>
      </div>
    </body>
    </html>
  `;
}

export async function exportExamPdf(pool: PoolId): Promise<void> {
  const questions = buildPracticeExam(pool);
  const html = buildHtml(questions, pool);

  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `${POOL_LABELS[pool]} Practice Exam`,
    UTI: 'com.adobe.pdf',
  });
}

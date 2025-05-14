import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// Interface pour les réponses du sondage
interface SurveyAnswer {
  id_answer: number;
  answer_text: string;
}

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Correction du typage avec RowDataPacket[]
    const [surveyAnswers] = await connection.execute<RowDataPacket[]>('SELECT * FROM sg_survey_answers_1');

    await connection.end();

    return NextResponse.json(surveyAnswers as SurveyAnswer[]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

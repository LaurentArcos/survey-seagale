// src/app/api/survey_answers/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [surveyAnswers] = await connection.execute('SELECT * FROM sg_survey_answers');
    await connection.end();

    return NextResponse.json(surveyAnswers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

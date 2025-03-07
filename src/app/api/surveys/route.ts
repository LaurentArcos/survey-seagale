import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// Interface pour les sondages
interface Survey {
  id: number;
  id_customer: number;
  name: string;
  id_answer: number;
  autre_answer: string | null;
  age: number;
  ville: string;
  postcode: string;
  pays: string;
  order_number: string;
  sexe: string;
  montant: string;
  date_add: string;
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
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT * FROM sg_survey');

    await connection.end();

    return NextResponse.json(rows as Survey[]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

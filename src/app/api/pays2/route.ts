import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// Interface pour les pays
interface Country {
  id_country: number;
  iso_code: string;
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
    const [rows] = await connection.execute<RowDataPacket[]>('SELECT id_country, iso_code FROM ps_country');

    await connection.end();

    // Caster les résultats en Country[]
    return NextResponse.json(rows as Country[]);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

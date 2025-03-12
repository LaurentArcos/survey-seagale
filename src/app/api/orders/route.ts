import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

// Interface pour les commandes
interface Order {
  id_order: number;
  date_add: string;
  current_state: number;
}

export async function GET() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Définition de la date seuil (4 mars 2025 à 19h00)
    const dateSeuil = '2025-03-04 19:00:00';

  
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id_order FROM ps_orders WHERE date_add >= ? AND current_state IN (2, 4, 5)',
      [dateSeuil]
    );

    await connection.end();

    return NextResponse.json({ orderCount: rows.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

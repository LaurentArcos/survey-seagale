import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";

// Définition de l'interface Order
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

    const dateSeuil = "2025-03-04 19:00:00"; // Date de référence
    const [rows] = await connection.execute<RowDataPacket[]>(
      "SELECT id_order FROM ps_orders WHERE date_add >= ? AND current_state IN (2, 4, 5)",
      [dateSeuil]
    );

    await connection.end();

    // Cast des résultats en Order[]
    const orders: Order[] = rows as Order[];

    return NextResponse.json({ orderCount: orders.length });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

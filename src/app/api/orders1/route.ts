import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";

// Définition de l'interface Order
interface Order {
  id_order: number;
  id_customer: number;
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

    // bornes de la plage
    const dateMin = "2025-03-04 19:00:00";
    const dateMax = "2025-04-24 11:40:00";

    const [rows] = await connection.execute<RowDataPacket[]>(
      `
      SELECT DISTINCT id_customer
      FROM ps_orders
      WHERE date_add >= ?
        AND date_add <= ?
        AND current_state IN (2, 4, 5)
      `,
      [dateMin, dateMax]
    );

    await connection.end();

    // Cast des résultats en Order[]
    const orders: Order[] = rows as Order[];

    return NextResponse.json({
      orderCount: orders.length,
      orders, 
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

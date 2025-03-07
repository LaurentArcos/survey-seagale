// src/app/api/pays/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  try {
    // Établir la connexion à la base de données via les variables d'environnement
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,      
      user: process.env.DB_USER,      
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,  
    });

    // Exécuter la requête pour récupérer id_country et iso_code depuis la table ps_country
    const [rows] = await connection.execute('SELECT id_country, iso_code FROM ps_country');

    // Fermer la connexion
    await connection.end();

    // Retourner les données au format JSON
    return NextResponse.json(rows);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

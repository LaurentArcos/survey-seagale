// src/app/api/surveys/route.ts
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function GET(request: Request) {
  try {
    // Établir la connexion à la base de données en utilisant les variables d'environnement
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,         
      user: process.env.DB_USER,         
      password: process.env.DB_PASSWORD, 
      database: process.env.DB_NAME,     
    });

    // Exécuter la requête pour récupérer les données de la table sg_survey
    const [rows] = await connection.execute('SELECT * FROM sg_survey');

    // Fermer la connexion
    await connection.end();

    // Retourner les données au format JSON
    return NextResponse.json(rows);
  } catch (error: any) {
    // En cas d'erreur, retourner une réponse JSON avec le message d'erreur
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

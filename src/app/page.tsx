"use client";

import { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface Survey {
  id: number;
  id_customer: number;
  name: string;
  id_answer: number;
  autre_answer: string | null;
  age: number;
  ville: string;
  postcode: string;
  pays: string; // Contient ici l'id du pays
  order_number: string;
  sexe: string;
  montant: string;
  date_add: string;
}

interface SurveyAnswer {
  id_answer: number;
  answer_text: string;
}

interface Country {
  id_country: number;
  iso_code: string;
}

export default function Home() {
  // États pour les données brutes
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  // Données du graphique
  const [chartData, setChartData] = useState<ChartData<"pie", number[], unknown> | null>(null);
  // Filtres
  const [selectedAnswer, setSelectedAnswer] = useState<string>("all");
  const [breakdown, setBreakdown] = useState<string>("none");

  // Récupération des sondages et des réponses
  useEffect(() => {
    async function fetchData() {
      try {
        const [surveysRes, surveyAnswersRes] = await Promise.all([
          fetch("/api/surveys"),
          fetch("/api/survey_answers"),
        ]);
        const surveysData: Survey[] = await surveysRes.json();
        const surveyAnswersData: SurveyAnswer[] = await surveyAnswersRes.json();
        setSurveys(surveysData);
        setSurveyAnswers(surveyAnswersData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    }
    fetchData();
  }, []);

  // Récupération des pays
  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("/api/pays");
        const data: Country[] = await res.json();
        setCountries(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des pays :", error);
      }
    }
    fetchCountries();
  }, []);

  // Calcul dynamique du graphique en fonction des filtres
  useEffect(() => {
    if (!surveys.length) return;

    let filteredSurveys = surveys;
    if (selectedAnswer !== "all") {
      filteredSurveys = surveys.filter(
        (survey) => survey.id_answer.toString() === selectedAnswer
      );
    }

    let counts: Record<string, number> = {};
    let labelSource = "";

    if (breakdown === "none") {
      // Regroupement global par id_answer
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.id_answer.toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "id_answer";
    } else if (breakdown === "pays") {
      // Regroupement par pays (id du pays)
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.pays;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "pays";
    } else if (breakdown === "sexe") {
      // Regroupement par sexe
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.sexe;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "sexe";
    }

    // Construction des labels en fonction du regroupement
    let labels: string[] = [];
    if (labelSource === "id_answer") {
      labels = Object.keys(counts).map((key) => {
        const found = surveyAnswers.find(
          (ans) => ans.id_answer.toString() === key
        );
        return found ? found.answer_text : key;
      });
    } else if (labelSource === "pays") {
      // Créer un mapping des pays : id_country -> iso_code
      const countryMapping = countries.reduce((acc, country) => {
        acc[country.id_country.toString()] = country.iso_code;
        return acc;
      }, {} as Record<string, string>);
      labels = Object.keys(counts).map((key) => countryMapping[key] || key);
    } else {
      labels = Object.keys(counts);
    }
    const values = Object.values(counts);

    setChartData({
      labels,
      datasets: [
        {
          label:
            breakdown === "none"
              ? "Répartition globale"
              : breakdown === "pays"
              ? "Répartition par pays"
              : "Répartition par sexe",
          data: values,
          backgroundColor: [
            "rgb(255, 99, 133)",
            "rgb(54, 163, 235)",
            "rgb(255, 207, 86)",
            "rgb(75, 192, 192)",
            "rgb(153, 102, 255)",
            "rgb(255, 69, 69)",
            "rgb(0, 170, 65)",
            "rgb(255, 160, 64)",
          ],
          borderColor: ["rgb(255, 255, 255)"],
          borderWidth: 1,
        },
      ],
    });
  }, [surveys, surveyAnswers, countries, selectedAnswer, breakdown]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      datalabels: {
        formatter: (value: number, context: any) => {
          const dataArr = context.chart.data.datasets[0].data as number[];
          const sum = dataArr.reduce((a, b) => a + b, 0);
          const percentage = ((value * 100) / sum).toFixed(2) + "%";
          return percentage;
        },
        color: "#fff",
        font: {
          weight: "bold" as const,
        },
      },
    },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Menu latéral */}
      <aside
        style={{
          width: "250px",
          padding: "20px",
          borderRight: "1px solid #ccc",
          boxSizing: "border-box",
        }}
      >
        <h2>Filtres</h2>
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Réponse :
          </label>
          <select
            value={selectedAnswer}
            onChange={(e) => setSelectedAnswer(e.target.value)}
            style={{ width: "100%", padding: "5px" }}
          >
            <option value="all">Toutes</option>
            {surveyAnswers.map((answer) => (
              <option key={answer.id_answer} value={answer.id_answer}>
                {answer.answer_text}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>
            Répartition :
          </label>
          <div>
            <input
              type="radio"
              id="none"
              name="breakdown"
              value="none"
              checked={breakdown === "none"}
              onChange={(e) => setBreakdown(e.target.value)}
            />
            <label htmlFor="none" style={{ marginLeft: "5px" }}>
              Global
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="pays"
              name="breakdown"
              value="pays"
              checked={breakdown === "pays"}
              onChange={(e) => setBreakdown(e.target.value)}
            />
            <label htmlFor="pays" style={{ marginLeft: "5px" }}>
              Par Pays
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="sexe"
              name="breakdown"
              value="sexe"
              checked={breakdown === "sexe"}
              onChange={(e) => setBreakdown(e.target.value)}
            />
            <label htmlFor="sexe" style={{ marginLeft: "5px" }}>
              Par Sexe
            </label>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: "20px", boxSizing: "border-box" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Statistiques
        </h1>
        {chartData ? (
          <div style={{ width: "1000px", height: "1000px", margin: "0 auto" }}>
            <Pie data={chartData} options={options} />
          </div>
        ) : (
          <p style={{ textAlign: "center" }}>Chargement...</p>
        )}
      </main>
    </div>
  );
}

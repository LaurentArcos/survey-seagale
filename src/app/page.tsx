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
  pays: string; // Ici, "pays" correspond à l'id du pays
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
  // Indicateur si aucune donnée ne correspond aux filtres
  const [emptyData, setEmptyData] = useState<boolean>(false);
  // Filtres
  const [selectedAnswer, setSelectedAnswer] = useState<string>("all");
  // "breakdown" peut être "none", "pays", "sexe", "departement" ou "age"
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

    // Filtrage des sondages selon la réponse sélectionnée
    let filteredSurveys = surveys;
    if (selectedAnswer !== "all") {
      filteredSurveys = surveys.filter(
        (survey) => survey.id_answer.toString() === selectedAnswer
      );
    }

    // Si aucun sondage ne correspond aux filtres, on indique qu'il n'y a aucune donnée
    if (filteredSurveys.length === 0) {
      setEmptyData(true);
      setChartData(null);
      return;
    } else {
      setEmptyData(false);
    }

    // Pour la réponse "Autre" (id_answer === "9"), on affichera une liste à part
    if (selectedAnswer === "9") {
      setChartData(null);
      return;
    }

    let counts: Record<string, number> = {};
    let labelSource = "";

    if (breakdown === "none") {
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.id_answer.toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "id_answer";
    } else if (breakdown === "pays") {
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.pays;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "pays";
    } else if (breakdown === "sexe") {
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.sexe;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "sexe";
    } else if (breakdown === "departement") {
      const frenchSurveys = filteredSurveys.filter(
        (survey) => survey.pays === "8"
      );
      if (frenchSurveys.length === 0) {
        setEmptyData(true);
        setChartData(null);
        return;
      }
      counts = frenchSurveys.reduce((acc, survey) => {
        const dept = survey.postcode.slice(0, 2);
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "departement";
    } else if (breakdown === "age") {
      counts = filteredSurveys.reduce((acc, survey) => {
        const key = survey.age.toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "age";
    }

    if (Object.keys(counts).length === 0) {
      setEmptyData(true);
      setChartData(null);
      return;
    } else {
      setEmptyData(false);
    }

    let labels: string[] = [];
    if (labelSource === "id_answer") {
      labels = Object.keys(counts).map((key) => {
        const found = surveyAnswers.find(
          (ans) => ans.id_answer.toString() === key
        );
        return found ? found.answer_text : key;
      });
    } else if (labelSource === "pays") {
      const countryMapping = countries.reduce((acc, country) => {
        acc[country.id_country.toString()] = country.iso_code;
        return acc;
      }, {} as Record<string, string>);
      labels = Object.keys(counts).map((key) => countryMapping[key] || key);
    } else if (labelSource === "departement") {
      labels = Object.keys(counts).map((key) => "Dépt " + key);
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
              : breakdown === "sexe"
              ? "Répartition par sexe"
              : breakdown === "departement"
              ? "Répartition par département"
              : "Répartition par âge",
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
        labels: {
          font: {
            size: 20, 
          },
        },
      },
      tooltip: {
        titleFont: {
          size: 18,
        },
        bodyFont: {
          size: 16,
        },
        footerFont: {
          size: 14,
        },
      },
      datalabels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (value: number, context: any) => {
          const dataArr = context.chart.data.datasets[0].data as number[];
          const sum = dataArr.reduce((a, b) => a + b, 0);
          const percentage = ((value * 100) / sum).toFixed(2) + "%";
          return percentage;
        },
        color: "#fff",
        font: {
          weight: "bold" as const,
          size: 20,
        },
      },
    },
  };

  // Liste des réponses "Autre"
  const otherResponses = surveys
    .filter(
      (survey) =>
        survey.id_answer.toString() === "9" &&
        survey.autre_answer &&
        survey.autre_answer.trim() !== ""
    )
    .map((survey) => survey.autre_answer as string);

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
          <div>
            <input
              type="radio"
              id="departement"
              name="breakdown"
              value="departement"
              checked={breakdown === "departement"}
              onChange={(e) => setBreakdown(e.target.value)}
            />
            <label htmlFor="departement" style={{ marginLeft: "5px" }}>
              Par Département
            </label>
          </div>
          <div>
            <input
              type="radio"
              id="age"
              name="breakdown"
              value="age"
              checked={breakdown === "age"}
              onChange={(e) => setBreakdown(e.target.value)}
            />
            <label htmlFor="age" style={{ marginLeft: "5px" }}>
              Par Âge
            </label>
          </div>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: "20px", boxSizing: "border-box" }}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          Statistiques
        </h1>
        {selectedAnswer === "9" ? (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Réponses &quot;Autre&quot;
            </h2>
            {otherResponses.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {otherResponses.map((resp, index) => (
                  <li
                    key={index}
                    style={{
                      background: "#f5f5f5",
                      marginBottom: "10px",
                      padding: "10px",
                      borderRadius: "5px",
                    }}
                  >
                    {resp}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ textAlign: "center" }}>
                Aucune réponse &quot;Autre&quot;
              </p>
            )}
          </div>
        ) : emptyData ? (
          <p style={{ textAlign: "center" }}>Aucune réponse</p>
        ) : chartData ? (
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

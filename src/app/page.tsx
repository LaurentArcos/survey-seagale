"use client";

import { useState, useCallback, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Context } from 'chartjs-plugin-datalabels';


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
  pays: string;
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
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [surveyAnswers, setSurveyAnswers] = useState<SurveyAnswer[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<number>(3); // 1, 2 ou 3
  const [chartData, setChartData] = useState<ChartData<"pie", number[], unknown> | null>(null);
  const [emptyData, setEmptyData] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("all");
  const [breakdown, setBreakdown] = useState<string>("none");
  const [orderCount, setOrderCount] = useState(0);

  const OTHER_ID = selectedSurvey === 1 ? "9" : selectedSurvey === 2 ? "7" : "0";

  const getApiPath = useCallback((base: string) => {
    if (selectedSurvey === 1) return `/api/${base}1`;
    if (selectedSurvey === 2) return `/api/${base}2`;
    return `/api/${base}`;
  }, [selectedSurvey]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [svRes, ansRes] = await Promise.all([
          fetch(getApiPath("surveys")),
          fetch(getApiPath("survey_answers")),
        ]);
        setSurveys(await svRes.json());
        setSurveyAnswers(await ansRes.json());
      } catch (err) {
        console.error("Loading survey data:", err);
      }
    }
    fetchData();
}, [getApiPath]);

  useEffect(() => {
    async function fetchCountries() {
      try {
        const res = await fetch("/api/pays");
        setCountries(await res.json());
      } catch (err) {
        console.error("Loading countries:", err);
      }
    }
    fetchCountries();
  }, []);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch(getApiPath("orders"));
        const json = await res.json();
        setOrderCount(json.orderCount);
      } catch (err) {
        console.error("Loading orders:", err);
      }
    }
    fetchOrders();
}, [getApiPath]);

  useEffect(() => {
    if (!surveys.length) return;

    const filteredSurveys = selectedAnswer !== "all"
      ? surveys.filter(s => s.id_answer.toString() === selectedAnswer)
      : surveys;

    if (filteredSurveys.length === 0) {
      setEmptyData(true);
      setChartData(null);
      return;
    } else {
      setEmptyData(false);
    }

    if (selectedAnswer === OTHER_ID && OTHER_ID !== "0") {
      setChartData(null);
      return;
    }

    let counts: Record<string, number> = {};
    let labelSource = "";

    if (breakdown === "none") {
      counts = filteredSurveys.reduce((acc, s) => {
        acc[s.id_answer.toString()] = (acc[s.id_answer.toString()] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "id_answer";
    } else if (breakdown === "pays") {
      counts = filteredSurveys.reduce((acc: Record<string, number>, s) => {
        acc[s.pays] = (acc[s.pays] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "pays";
    } else if (breakdown === "sexe") {
      counts = filteredSurveys.reduce((acc: Record<string, number>, s) => {
        acc[s.sexe] = (acc[s.sexe] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "sexe";
    } else if (breakdown === "departement") {
      const french = filteredSurveys.filter(s => s.pays === "8");
      if (!french.length) {
        setEmptyData(true);
        setChartData(null);
        return;
      }
      counts = french.reduce((acc: Record<string, number>, s) => {
        const dept = s.postcode.slice(0, 2);
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "departement";
    } else if (breakdown === "age") {
      counts = filteredSurveys.reduce((acc: Record<string, number>, s) => {
        const key = s.age.toString();
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      labelSource = "age";
    }

    if (!Object.keys(counts).length) {
      setEmptyData(true);
      setChartData(null);
      return;
    }

    const labels = Object.keys(counts).map(key => {
      if (labelSource === "id_answer") {
        const found = surveyAnswers.find(ans => ans.id_answer.toString() === key);
        return found ? found.answer_text : key;
      }
      if (labelSource === "pays") {
        const map = countries.reduce((acc, c) => {
          acc[c.id_country.toString()] = c.iso_code;
          return acc;
        }, {} as Record<string, string>);
        return map[key] || key;
      }
      if (labelSource === "departement") return "Dépt " + key;
      return key;
    });

    setChartData({
      labels,
      datasets: [
        {
          label: "Répartition",
          data: Object.values(counts),
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
  }, [surveys, surveyAnswers, countries, selectedAnswer, breakdown, OTHER_ID]);

  const otherResponses = surveys
    .filter(s => s.id_answer.toString() === OTHER_ID && s.autre_answer?.trim())
    .map(s => s.autre_answer as string);

  const totalVotes = emptyData || selectedAnswer === OTHER_ID ? 0 : (selectedAnswer !== "all" ? surveys.filter(s => s.id_answer.toString() === selectedAnswer).length : surveys.length);

  const votePercentage = orderCount > 0 ? ((totalVotes / orderCount) * 100).toFixed(2) + "%" : "N/A";

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const, labels: { font: { size: 20 } } },
      tooltip: {
        titleFont: { size: 18 },
        bodyFont: { size: 16 },
        footerFont: { size: 14 },
      },
      datalabels: {
formatter: (value: number, context: Context) => {
  const dataArr = context.chart.data.datasets[0].data as number[];
  const sum = dataArr.reduce((a, b) => a + b, 0);
  return ((value * 100) / sum).toFixed(2) + "%";
},
        color: "#fff",
        font: { weight: "bold" as const, size: 20 },
      },
    },
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: "250px", padding: "20px", borderRight: "1px solid #ccc" }}>
        <label style={{ display: "block", marginBottom: "10px" }}>Choisir un sondage :</label>
        <select value={selectedSurvey} onChange={(e) => setSelectedSurvey(Number(e.target.value))} style={{ width: "100%", padding: "5px", marginBottom: "20px" }}>
          <option value={1}>Sondage 1</option>
          <option value={2}>Sondage 2</option>
          <option value={3}>Sondage 3</option>
        </select>

        <h2>Filtres</h2>
        <div style={{ marginBottom: "20px" }}>
          <label>Réponse :</label>
          <select value={selectedAnswer} onChange={(e) => setSelectedAnswer(e.target.value)} style={{ width: "100%", padding: "5px" }}>
            <option value="all">Toutes</option>
            {surveyAnswers.map(ans => (
              <option key={ans.id_answer} value={ans.id_answer}>{ans.answer_text}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Répartition :</label>
          {["none", "pays", "sexe", "departement", "age"].map(key => (
            <div key={key}>
              <input type="radio" id={key} name="breakdown" value={key} checked={breakdown === key} onChange={(e) => setBreakdown(e.target.value)} />
              <label htmlFor={key} style={{ marginLeft: "5px" }}>Par {key}</label>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "20px", backgroundColor: "#f9f9f9", textAlign: "center", borderRadius: "5px", padding: "10px" }}>
          <h3>Nombre de commandes</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{orderCount}</p>
        </div>

        <div style={{ marginTop: "20px", backgroundColor: "#f9f9f9", textAlign: "center", borderRadius: "5px", padding: "10px" }}>
          <h3>Total des votes</h3>
          <p style={{ fontSize: "20px", fontWeight: "bold" }}>{totalVotes}</p>
          <p style={{ fontSize: "14px", color: "#555" }}>({votePercentage} des commandes)</p>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "20px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "1rem", fontSize: "1.25rem" }}>
          {selectedSurvey === 1
            ? "Comment nous avez-vous connus ?"
            : selectedSurvey === 2
            ? "Qu'est-ce qui vous a convaincu d'acheter chez Seagale ?"
            : "Quel est votre réseau social favori ?"}
        </h2>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Statistiques</h1>

        {selectedAnswer === OTHER_ID && OTHER_ID !== "0" ? (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Réponses &quot;Autre&quot;
            </h2>
            {otherResponses.length ? (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {otherResponses.map((resp, i) => (
                  <li key={i} style={{ background: "#f5f5f5", marginBottom: "10px", padding: "10px", borderRadius: "5px" }}>{resp}</li>
                ))}
              </ul>
            ) : <p style={{ textAlign: "center" }}>Aucune réponse &quot;Autre&quot;</p>}
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
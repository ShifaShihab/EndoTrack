import './SymptomTracker.css';
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot, Timestamp } from "firebase/firestore";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Legend, Title, Tooltip } from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Title, Tooltip);

const SymptomTracker = () => {
  const [symptoms, setSymptoms] = useState({
    cramps: 0,
    nausea: 0,
    moodSwings: 0,
    fatigue: 0,
    headaches: 0,
    bloating: 0,
    lowerBackPain: 0,
    heavyBleeding: 0,
    acneBreakouts: 0,
    dizziness: 0,
  });

  const [periodStartDate, setPeriodStartDate] = useState("");
  const [loggedSymptoms, setLoggedSymptoms] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "symptoms"), (snapshot) => {
      setLoggedSymptoms(snapshot.docs.map(doc => doc.data()));
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setSymptoms({ ...symptoms, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const handlePeriodChange = (e) => {
    setPeriodStartDate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "symptoms"), {
      ...symptoms,
      periodStartDate: periodStartDate ? Timestamp.fromDate(new Date(periodStartDate)) : null,
      timestamp: Timestamp.now(),
    });
    setSymptoms({
      cramps: 0,
      nausea: 0,
      moodSwings: 0,
      fatigue: 0,
      headaches: 0,
      bloating: 0,
      lowerBackPain: 0,
      heavyBleeding: 0,
      acneBreakouts: 0,
      dizziness: 0,
    });
     // Clear period date after submitting
  };

  const calculateAverageSymptom = (symptom) => {
    const data = loggedSymptoms.map(entry => entry[symptom]).filter(value => value != null);
    return data.length > 0 ? data.reduce((sum, value) => sum + value, 0) / data.length : 0;
  };

  const analyzeSymptomTrend = (symptom) => {
    const data = loggedSymptoms.map(entry => entry[symptom] || 0);
    if (data.length < 2) return "Not enough data to analyze trend";
    let increaseCount = 0;
    let decreaseCount = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i] > data[i - 1]) {
        increaseCount += 1;
      } else if (data[i] < data[i - 1]) {
        decreaseCount += 1;
      }
    }
    if (increaseCount > decreaseCount) return "Increasing";
    if (decreaseCount > increaseCount) return "Decreasing";
    return "Stable";
  };

  const getMaxMinIntensity = (symptom) => {
    const data = loggedSymptoms.map(entry => entry[symptom] || 0);
    const max = Math.max(...data);
    const min = Math.min(...data);
    return { max, min };
  };

  const countFrequentSymptoms = (symptom) => {
    return loggedSymptoms.filter(entry => entry[symptom] > 5).length;
  };

  const analyzeCorrelation = (symptom1, symptom2) => {
    const data1 = loggedSymptoms.map(entry => entry[symptom1] || 0);
    const data2 = loggedSymptoms.map(entry => entry[symptom2] || 0);
    if (data1.length !== data2.length || data1.length < 2) return "Not enough data for correlation analysis";

    const sum1 = data1.reduce((a, b) => a + b, 0);
    const sum2 = data2.reduce((a, b) => a + b, 0);
    const mean1 = sum1 / data1.length;
    const mean2 = sum2 / data2.length;

    const numerator = data1.reduce((sum, value, i) => sum + (value - mean1) * (data2[i] - mean2), 0);
    const denominator1 = Math.sqrt(data1.reduce((sum, value) => sum + Math.pow(value - mean1, 2), 0));
    const denominator2 = Math.sqrt(data2.reduce((sum, value) => sum + Math.pow(value - mean2, 2), 0));

    const correlation = numerator / (denominator1 * denominator2);
    return correlation > 0.5 ? "Strong Positive Correlation" : correlation < -0.5 ? "Strong Negative Correlation" : "Weak or No Correlation";
  };

  const chartData = {
    labels: loggedSymptoms.map(entry => new Date(entry.timestamp?.toDate()).toLocaleDateString() || "Unknown Date"),
    datasets: Object.keys(symptoms).map((symptom, i) => ({
      label: symptom.replace(/([A-Z])/g, " $1").trim(),
      data: loggedSymptoms.map(entry => entry[symptom] || 0),
      borderColor: `hsl(${i * 36}, 80%, 50%)`,
      borderWidth: 2,
      fill: false,
    })),
  };

  const chartOptions = {
    plugins: {
      legend: { display: true, position: "top" },
      title: { display: true, text: "Symptom Tracking Over Time" },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Symptom Intensity (0-10)" },
      },
      x: { title: { display: true, text: "Date of Entry" } },
    },
  };

  return (
    <div>
      <h2>Symptom Tracker</h2>
      <form onSubmit={handleSubmit}>
        {Object.keys(symptoms).map((symptom) => (
          <div key={symptom}>
            <label>{symptom.replace(/([A-Z])/g, " $1").trim()}:</label>
            <input
              type="number"
              name={symptom}
              value={symptoms[symptom]}
              onChange={handleChange}
              min="0"
              max="10"
              required
            />
          </div>
        ))}
        <div>
          <label>Period Start Date:</label>
          <input
            type="date"
            value={periodStartDate}
            onChange={handlePeriodChange}
          />
        </div>
        <button type="submit">Log Symptoms</button>
      </form>

      {loggedSymptoms.length > 0 && (
        <div>
          <h3>Symptom History</h3>
          <Line data={chartData} options={chartOptions} />

          <div>
            <h3>Analysis</h3>
            <ul>
              {Object.keys(symptoms).map((symptom) => (
                <li key={symptom}>
                  <strong>{symptom.replace(/([A-Z])/g, " $1").trim()}</strong>:<br />
                  Average Intensity: {calculateAverageSymptom(symptom).toFixed(2)}<br />
                  Trend: {analyzeSymptomTrend(symptom)}<br />
                  Max Intensity: {getMaxMinIntensity(symptom).max}<br />
                  Min Intensity: {getMaxMinIntensity(symptom).min}<br />
                  Occurrences  > 5: {countFrequentSymptoms(symptom)}<br />
                </li>
              ))}
              <li>
                <strong>Correlation Between Cramps and Nausea:</strong><br />
                {analyzeCorrelation('cramps', 'nausea')}
              </li>
              <li>
                <strong>Period Start Date:</strong> {periodStartDate || "Not Set"}
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default SymptomTracker;

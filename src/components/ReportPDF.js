import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    marginBottom: 10,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    fontSize: 12,
  },
});

const ReportPDF = ({ symptoms, periodDates }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.heading}>Symptom Tracker Report</Text>

      <View style={styles.section}>
        <Text style={styles.heading}>Period Dates</Text>
        <Text style={styles.text}>Start: {periodDates.start ? periodDates.start.toLocaleDateString() : "N/A"}</Text>
        <Text style={styles.text}>End: {periodDates.end ? periodDates.end.toLocaleDateString() : "N/A"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.heading}>Symptom Summary</Text>
        {symptoms.map((entry, index) => (
          <View key={index}>
            {Object.keys(entry).map(symptom => (
              symptom !== "timestamp" && symptom !== "periodStart" && symptom !== "periodEnd" && (
                <Text key={symptom} style={styles.text}>
                  {symptom}: {entry[symptom]}
                </Text>
              )
            ))}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default ReportPDF;

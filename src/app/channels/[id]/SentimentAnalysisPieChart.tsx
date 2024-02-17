"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#3B82F6'];

type SentimentAnalysisResult = {
  positive: number;
  negative: number;
  neutral: number;
  content_quality?: string;
};

const SentimentAnalysisPieChart = ({ sentimentAnalysis }: { sentimentAnalysis: SentimentAnalysisResult | undefined }) => {

  const data = sentimentAnalysis ? [
    { name: 'Positive', value: sentimentAnalysis.positive },
    { name: 'Negative', value: sentimentAnalysis.negative },
    { name: 'Neutral', value: sentimentAnalysis.neutral },
  ] : [];

  return (
  <PieChart width={400} height={400}>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      outerRadius={150}
      fill="#8884d8"
      dataKey="value"
      label={({ name, value }) => `${name}: ${value}`}
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
  );
};

export default SentimentAnalysisPieChart;

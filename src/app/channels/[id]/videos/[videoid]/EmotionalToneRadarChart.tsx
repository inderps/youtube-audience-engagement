'use client';
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from 'recharts';

interface EmotionalTone {
  emotion: string;
  value: number;
}

interface EmotionalToneRadarChartProps {
  data: EmotionalTone[];
}

const EmotionalToneRadarChart = ({ data }: EmotionalToneRadarChartProps) => {
  return (
    <RadarChart
      cx={300}
      cy={250}
      outerRadius={150}
      width={600}
      height={500}
      data={data}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="emotion" />
      <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} />
      <Radar
        name="Emotional Tone"
        dataKey="value"
        stroke="#8884d8"
        fill="#8884d8"
        fillOpacity={0.6}
      />
      <Legend />
    </RadarChart>
  );
};

export default EmotionalToneRadarChart;

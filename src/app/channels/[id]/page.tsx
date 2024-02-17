import OpenaiService from '../../services/openaiService';
import { sequelize } from '../../models/sequelize';
import SentimentAnalysisPieChart from './SentimentAnalysisPieChart';

interface PageProps {
  params: { id: string };
}

const openaiService = new OpenaiService(sequelize);

export default async function Page({ params }: PageProps) {
  const result = await openaiService.analyzeOverallSentiments(
    parseInt(params.id),
  );

  return (
    <div className="dark:bg-gray-800 dark:text-gray-200 p-4">
      <div className="flex justify-center items-center">
        <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-1/2">
          <h2 className="text-xl font-semibold mb-4">
            Sentiment Analysis for overall channel
          </h2>
          {result?.content_quality && (
            <p className="mt-4">{result.content_quality}</p>
          )}
          <SentimentAnalysisPieChart sentimentAnalysis={result} />
        </div>
      </div>
    </div>
  );
}

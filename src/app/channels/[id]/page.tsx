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

  // answers = "suggestion1, suggestion 2, suggestion 3"
  const suggestions = await openaiService.analyzeTopVideoRequests(
    parseInt(params.id),
  );

  return (
    <div className="dark:bg-gray-800 dark:text-gray-200 p-4">
      <div className="flex justify-center items-start gap-4 flex-row">
        <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-4">
            Sentiment Analysis for overall channel
          </h2>
          {result && <SentimentAnalysisPieChart sentimentAnalysis={result} />}
          {result?.content_quality && (
            <p className="mt-4">{result.content_quality}</p>
          )}
        </div>

        <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-full md:w-1/2">
          <h2 className="text-xl font-semibold mb-4">Top Video Requests</h2>
          <ul className="list-disc pl-5">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

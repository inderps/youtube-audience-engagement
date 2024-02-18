import OpenaiService from '../../../../services/openaiService';
import { sequelize } from '../../../../models/sequelize';
import SentimentAnalysisPieChart from './../../SentimentAnalysisPieChart';
import EmotionalToneRadarChart from './EmotionalToneRadarChart';
import Channel from '../../../../models/channel';
import Video from '../../../../models/video';
import Comment from '../../../../models/comment';
import Sidebar from '../../../../components/Sidebar';

interface PageProps {
  params: { id: string; videoid: string };
}

const openaiService = new OpenaiService(sequelize);

export default async function Page({ params }: PageProps) {
  const channelId = parseInt(params.id);
  const videoId = parseInt(params.videoid);

  const channel = await Channel.findByPk(channelId, {
    include: [
      {
        model: Video,
        include: [{ model: Comment }],
      },
    ],
  });

  const video = channel?.videos.find((video) => video.id === videoId);

  const result = await openaiService.analyzeSentimentsForVideo(video!);

  const suggestions = await openaiService.analyzeTopVideoRequestsForVideo(
    video!,
  );

  const faqs = await openaiService.faqInsideComments(video!);

  const emotionalToneData = await openaiService.analyzeEmotionalTone(video!);
  const emotionalToneChartData = Object.keys(emotionalToneData).map((key) => ({
    emotion: key,
    value: emotionalToneData[key],
  }));

  return (
    <div className="dark:bg-gray-800 dark:text-gray-200 p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{video!.name}</h1>
      </div>
      <div className="flex justify-between items-start gap-4">
        <Sidebar
          channelId={channelId}
          videos={
            channel?.videos.map((video) => ({
              id: video.id,
              name: video.name,
            })) || []
          }
        />
        <div className="flex gap-4 w-full md:w-3/4">
          <div className="flex flex-col gap-4 w-1/2">
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-full">
              <h2 className="text-xl font-semibold mb-4">Sentiment Analysis</h2>
              {result && (
                <SentimentAnalysisPieChart sentimentAnalysis={result} />
              )}
              {result?.content_quality && (
                <p className="mt-4">{result.content_quality}</p>
              )}
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-full">
              <h2 className="text-xl font-semibold mb-4">FAQs</h2>
              <ul className="list-disc pl-5">
                {faqs.map((faq, index) => (
                  <li key={index}>{faq}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-1/2">
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-full">
              <h2 className="text-xl font-semibold mb-4">Top Video Requests</h2>
              <ul className="list-disc pl-5">
                {suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg shadow-lg w-full">
              <h2 className="text-xl font-semibold mb-4">
                Emotional Tone Analysis
              </h2>
              <EmotionalToneRadarChart data={emotionalToneChartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

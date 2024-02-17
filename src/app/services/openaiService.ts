import { OpenAI } from 'openai';
import Channel from '../models/channel';
import Video from '../models/video';
import Comment from '../models/comment';
import { Sequelize } from 'sequelize-typescript';

interface SentimentAnalysisResult {
  positive: number;
  negative: number;
  neutral: number;
  content_quality: string;
}

export default class OpenaiService {
  private sequelize: Sequelize;
  private openai: OpenAI;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeOverallSentiments(
    channelId: number,
  ): Promise<SentimentAnalysisResult | undefined> {
    // return new Promise(async (resolve, reject) => (resolve({ positive: 100, negative: 0, neutral: 0, content_quality: 'Audience values the content for being great, loved, and very informative.' })));

    const channel = await Channel.findByPk(channelId, {
      include: [
        {
          model: Video,
          include: [{ model: Comment }],
        },
      ],
    });

    let combinedComments = '';
    for (const video of channel?.videos || []) {
      for (const comment of video.comments) {
        combinedComments += `Video: ${video.name}\nComment: ${comment.text}\n`;
      }
    }

    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            "You are a youtube video comments analyzer for a whole channel. Summarize the main concerns and overall feelings of the audience about the videos based on the comments provided below, focusing on the content creator's value. Provide the overall feelings of the audience in percentages (positive, negative, neutral), excluding negative sentiments not related to content quality. The summary should be in JSON format, including counts of positive, negative, and neutral sentiments Eg: { positive: 100, negative: 0, neutral: 0 content_quality: 'Audience values the content for being great, loved, and very informative.' }. Do not include ``json quotes in your response. I will directly do JSON.parse(answer) to your answer. Exclude comments that are not related to the content creator's value. Don't count them",
        },
        { role: 'user', content: combinedComments },
      ],
      model: 'gpt-3.5-turbo-0125',
    });

    const responseText = completion.choices[0].message.content?.trim();

    if (!responseText) {
      return;
    }

    const analysisResult: SentimentAnalysisResult = JSON.parse(responseText);
    return analysisResult;
  }
}

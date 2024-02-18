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

  async analyzeSentimentsForVideo(
    video: Video,
  ): Promise<SentimentAnalysisResult | undefined> {
    const message =
      "You are a youtube video comments analyzer for a youtube video. Summarize the main concerns and overall feelings of the audience about the video based on the comments provided below, focusing on the content creator's value. Provide the overall feelings of the audience in percentages (positive, negative, neutral), excluding negative sentiments not related to content quality. The summary should be in JSON format, including counts of positive, negative, and neutral sentiments Eg: { positive: 100, negative: 0, neutral: 0 content_quality: 'Audience values the content for being great, loved, and very informative.' }. Do not include ``json quotes in your response. Also keys should be under quotes. I will directly do JSON.parse(answer) to your answer. Make sure that content_quality is atleast 300 words longs. Don't invenst your own content, make it totally based on comments. Exclude comments that are not related to the content creator's value. Don't count them";

    const responseText = await this.askAboutVideo(video, message);

    if (!responseText) {
      return;
    }

    const analysisResult: SentimentAnalysisResult = JSON.parse(responseText);
    return analysisResult;
  }

  async analyzeTopVideoRequestsForVideo(video: Video): Promise<string[]> {
    const message =
      "You are a youtube video comments analyzer for a youtube video. Given the following comments from a YouTube video, identify and return a list of the top 3 most requested videos or topics that the audience wants from the content creator. Ensure these are requests directed towards the content creator for future content. If there is no direct request, analyse the comments and suggest based on the discussions, what they might want as next topic. Do mention it if its directly asked or you analysed based on discussions. Make sure each suggestion is atleast 200 words long. Elaborate it properly. Please format your response as a direct JSON array containing three strings, each representing a distinct video suggestion. For example, the response should look like this { 'suggestions': ['suggestion 1', 'suggestion 2'], ['suggestion 3'] }.";

    const responseText =
      (await this.askAboutVideo(video, message)) || '{ "suggestions": [] }';
    return JSON.parse(responseText)['suggestions'] || [];
  }

  async analyzeOverallSentiments(
    channelId: number,
  ): Promise<SentimentAnalysisResult | undefined> {
    // return new Promise(async (resolve, reject) => (resolve({ positive: 100, negative: 0, neutral: 0, content_quality: 'Audience values the content for being great, loved, and very informative.' })));

    const message =
      "You are a youtube video comments analyzer for a whole channel. Summarize the main concerns and overall feelings of the audience about the videos based on the comments provided below, focusing on the content creator's value. Provide the overall feelings of the audience in percentages (positive, negative, neutral), excluding negative sentiments not related to content quality. The summary should be in JSON format, including counts of positive, negative, and neutral sentiments Eg: { positive: 100, negative: 0, neutral: 0 content_quality: 'Audience values the content for being great, loved, and very informative.' }. Do not include ``json quotes in your response. Also keys should be under quotes. I will directly do JSON.parse(answer) to your answer. Make sure that content_quality is atleast 300 words longs. Don't invenst your own content, make it totally based on comments. Exclude comments that are not related to the content creator's value. Don't count them";

    const responseText = await this.ask(channelId, message);

    if (!responseText) {
      return;
    }

    const analysisResult: SentimentAnalysisResult = JSON.parse(responseText);
    return analysisResult;
  }

  async analyzeTopVideoRequests(channelId: number): Promise<string[]> {
    // return new Promise(async (resolve, reject) => (resolve({ positive: 100, negative: 0, neutral: 0, content_quality: 'Audience values the content for being great, loved, and very informative.' })));

    const message =
      "You are a youtube video comments analyzer for a whole channel. Given the following comments from a YouTube channel, identify and return a comma-separated list of the top 3 most requested videos or topics that the audience wants from the content creator. Ensure these are requests directed towards the content creator for future content. If there is no direct request, analyse the comments and suggest based on the discussions, what they might want as next topic. Do mention it if its directly asked or you analysed based on discussions. Make sure each suggestion is atleast 200 words long. Elaborate it properly. Please format your response as a direct JSON array containing three strings, each representing a distinct video suggestion. For example, the response should look like this { 'suggestions': ['suggestion 1', 'suggestion 2'], ['suggestion 3'] }.";

    const responseText =
      (await this.ask(channelId, message)) || '{ "suggestions": [] }';
    return JSON.parse(responseText)['suggestions'] || [];
  }

  async ask(channelId: number, message: string): Promise<string | undefined> {
    const channel = await Channel.findByPk(channelId, {
      include: [
        {
          model: Video,
          include: [{ model: Comment }],
        },
      ],
    });

    const combinedComments = [];
    for (const video of channel?.videos || []) {
      let combinedCommentsForVideo = `Comments for Video: ${video.name}\n`;
      for (const comment of video.comments) {
        combinedCommentsForVideo += `c:${comment.text}\n`;
      }
      combinedComments.push(combinedCommentsForVideo);
    }

    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: message,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...combinedComments.map((comment) => ({
          role: 'user',
          content: comment,
        })),
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
    });

    console.log('responseText', completion.choices[0].message.content); // eslint-disable-line no-console

    return completion.choices[0].message.content?.trim();
  }

  async askAboutVideo(
    video: Video,
    message: string,
  ): Promise<string | undefined> {
    let combinedCommentsForVideo = `Comments for Video: ${video.name}\n`;
    for (const comment of video.comments) {
      combinedCommentsForVideo += `c:${comment.text}\n`;
    }

    const completion = await this.openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: message,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
          role: 'user',
          content: combinedCommentsForVideo,
        },
      ],
      model: 'gpt-3.5-turbo',
      response_format: { type: 'json_object' },
    });

    console.log('responseText', completion.choices[0].message.content); // eslint-disable-line no-console

    return completion.choices[0].message.content?.trim();
  }
}

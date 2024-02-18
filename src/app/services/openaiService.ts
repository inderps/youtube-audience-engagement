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

interface EmotionalToneAnalysisResult {
  [key: string]: number;
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

  async prepareUseePersona(channel: Channel): Promise<string | undefined> {
    const message = `
      You are tasked with analyzing comments from several YouTube videos of a particular channel to construct a collective audience persona with no limit on text. Make it bigger. This persona should accurately reflect the audience's preferences, including their likes and dislikes, as directly expressed in their comments. Focus on compiling insights that paint a vivid picture of what the audience values in the content, what they do not favor, and any prevalent themes or sentiments that emerge from their feedback.

      The ultimate goal of this analysis is to create a detailed persona that not only encapsulates the audience's current views and preferences but also serves as a foundation for predicting how they might react to future content topics. This predictive aspect of the persona will guide content creation strategies, aiming to align future videos more closely with viewer expectations and preferences, thereby enhancing engagement and satisfaction.

      Remember, the persona should focus more on the information provided in the comments, you can make assumptions or extrapolations but don't over invent things too much.
      The response must be in pure essay format as paragraph to persona key in JSON format. Eg: { "persona": "bla bla" }
      `;

    let persona = 'EMPTY';
    for (const video of channel.videos) {
      const promptMessage = `${message}. Here is the previous personna you created. ${persona}. Add new information by analysing following comments and give me back complete comprehensive text about the audience also keep the previous persona in response too. Club them together and create final essay in paragraph to persona key in JSON format. Keep it quite elaborate. Eg: { "persona": "bla bla" }.`;
      const responseText = await this.askAboutVideo(video, promptMessage);
      persona = JSON.parse(responseText!)['persona'] || '';
    }

    console.log('responseText', persona); // eslint-disable-line no-console

    return persona;
  }

  async analyzeSentimentsForVideo(
    video: Video,
  ): Promise<SentimentAnalysisResult | undefined> {
    if (video.sentimentsForVideo) {
      const existingAnalysis = JSON.parse(video.sentimentsForVideo);
      return existingAnalysis;
    }

    const message =
      "As a YouTube video comments analyzer, your task is to distill the primary concerns and overall sentiments expressed by viewers regarding the video, with a particular emphasis on assessing the value provided by the content creator. Your analysis should quantify the audience's reactions in terms of positive, negative, and neutral feedback, specifically omitting any negative comments that do not pertain to the quality of the content itself. The outcome should be formatted in JSON, detailing the counts of positive, negative, and neutral sentiments, for example: { positive: 100, negative: 0, neutral: 0, content_quality: The audience highly regards the content for its exceptional quality, engaging presentation, and informative nature.}. Ensure that your response strictly adheres to JSON syntax, with all keys enclosed in double quotes, and do not manually add JSON syntax markers in your response. The content_quality field must be derived directly from viewer comments, extending to at least 300 words, to accurately reflect whether the content is deemed valuable and useful by the audience. Exclude any feedback irrelevant to evaluating the content creator's contribution, focusing solely on comments that address the utility and value of the content provided.";

    const responseText = await this.askAboutVideo(video, message);

    if (!responseText) {
      return;
    }

    video.sentimentsForVideo = responseText;
    await video.save();

    const analysisResult: SentimentAnalysisResult = JSON.parse(responseText);
    return analysisResult;
  }

  async analyzeTopVideoRequestsForVideo(video: Video): Promise<string[]> {
    if (video.topVideoRequests) {
      const existingAnalysis = JSON.parse(video.topVideoRequests)[
        'suggestions'
      ];
      return existingAnalysis;
    }

    const message =
      "You are a youtube video comments analyzer for a youtube video. Given the following comments from a YouTube video, identify and return a list of the top 3 most requested videos or topics that the audience wants from the content creator. Ensure these are requests directed towards the content creator for future content. If there is no direct request, analyse the comments and suggest based on the discussions, what they might want as next topic. Do mention it if its directly asked or you analysed based on discussions. Make sure each suggestion is atleast 200 words long. Elaborate it properly. Please format your response as a direct JSON array containing three strings, each representing a distinct video suggestion. For example, the response should look like this { 'suggestions': ['suggestion 1', 'suggestion 2'], ['suggestion 3'] }.";

    const responseText =
      (await this.askAboutVideo(video, message)) || '{ "suggestions": [] }';

    video.topVideoRequests = responseText;
    await video.save();

    return JSON.parse(responseText)['suggestions'] || [];
  }

  async faqInsideComments(video: Video): Promise<string[]> {
    if (video.faqInsideComments) {
      const existingAnalysis = JSON.parse(video.faqInsideComments)['faqs'];
      return existingAnalysis;
    }

    const message = `
      You are an analyzer specializing in deriving insights from YouTube video comments. Your task is to sift through comments on a specific video and compile a list of the top frequently asked questions (FAQs) by the audience. These questions should reflect recurring inquiries or concerns that viewers have expressed, indicating areas where they seek further clarification or additional information.

      Focus on identifying direct questions posed by viewers or implied questions based on the discussions in the comments. If direct questions are scarce, use your analysis to infer the most likely questions based on the topics discussed. Each identified FAQ should be derived from actual comments, highlighting the audience's desire for more information or clarification on those topics.

      Please return your findings in a JSON array format, containing the top FAQs as strings. Each FAQ should be clearly stated as a question, and you should ensure that they are representative of the comments analyzed. The response should look like this:

      {
        "faqs": [
          "What specific techniques were used in the video for ...?",
          "Can you elaborate on the part where you discussed ...?",
          "How does this process compare to ...?"
        ]
      }

      Each FAQ should be concise yet informative, providing a clear question that captures the essence of what viewers are keen to understand further. Exclude any questions not related to the content's informational value or those that do not contribute to a deeper understanding of the video's topics.
    `;

    const responseText =
      (await this.askAboutVideo(video, message)) || '{ "faqs": [] }';

    video.faqInsideComments = responseText;
    await video.save();

    return JSON.parse(responseText)['faqs'] || [];
  }

  async analyzeEmotionalTone(
    video: Video,
  ): Promise<EmotionalToneAnalysisResult> {
    if (video.emotionalTone) {
      const existingAnalysis = JSON.parse(video.emotionalTone)['emotions'];
      return existingAnalysis;
    }

    const message = `
      You are an analyzer specializing in deriving emotions from YouTube video comments. Your task is to sift through comments on a specific video and compile a list of emotions exporessed (Happiness, Frustration, Curosity, Sadness, Excitement etc). Provide a count for each category.

      Please return your findings in a JSON array format, containing the top FAQs as strings. Each FAQ should be clearly stated as a question, and you should ensure that they are representative of the comments analyzed. The response should look like this:

      {
        "emotions": {
          "Happiness": 10,
          "Frustration": 5,
          "Curiosity": 3,
          "Sadness": 2,
          "Excitement": 7
        }
      }
    `;

    const responseText =
      (await this.askAboutVideo(video, message)) || '{ "emotions": {} }';

    video.emotionalTone = responseText;
    await video.save();

    return JSON.parse(responseText)['emotions'] || {};
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

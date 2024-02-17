import { Sequelize } from 'sequelize-typescript';
import OpenaiService from '../openaiService';
import Channel from '../../models/channel';
import Video from '../../models/video';
import Comment from '../../models/comment';
import { sequelizeTest } from '../../models/sequelizeTest';

describe('OpenaiService', () => {
  let openaiService: OpenaiService;

  beforeAll(async () => {
    await sequelizeTest.sync({ force: true });
    openaiService = new OpenaiService(sequelizeTest);
  });

  afterAll(async () => {
    await sequelizeTest.close();
  });

  test('analyzes overall sentiments from comments', async () => {
    const channel = await Channel.create({ name: 'Test Channel', youtubeId: 'testchannel123' });
    const videoTitles = ['Video 1', 'Video 2'];
    for (let title of videoTitles) {
      const video = await Video.create({ name: title, channelId: channel.id, youtubeId: 'testvideo123' });
      await Comment.bulkCreate([
        { text: 'Great video!', videoId: video.id, channelId: channel.id },
        { text: 'Very informative', videoId: video.id, channelId: channel.id },
        { text: 'Loved it!', videoId: video.id, channelId: channel.id }
      ]);
    }

    const response = await openaiService.analyzeOverallSentiments(channel.id);

    console.log(response);

    // expect(response).toEqual({
    //   'Video 1': {


  

    // Assertions
    // Here you should assert the expected behavior/output of your method.
    // This could involve checking if the method correctly logs the output,
    // or if it saves the analysis result somewhere, depending on your implementation.
  });
});


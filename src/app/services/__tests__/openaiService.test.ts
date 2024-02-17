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
    const channel = await Channel.create({
      name: 'Test Channel',
      youtubeId: 'testchannel123',
    });
    const videoTitles = ['Video 1', 'Video 2'];
    for (const title of videoTitles) {
      const video = await Video.create({
        name: title,
        channelId: channel.id,
        youtubeId: 'testvideo123',
      });
      await Comment.bulkCreate([
        { text: 'Great video!', videoId: video.id, channelId: channel.id },
        { text: 'Very informative', videoId: video.id, channelId: channel.id },
        { text: 'Loved it!', videoId: video.id, channelId: channel.id },
      ]);
    }

    const response = await openaiService.analyzeOverallSentiments(channel.id);

    expect(response).toHaveProperty('positive');
    expect(response).toHaveProperty('negative');
    expect(response).toHaveProperty('neutral');
  });
});

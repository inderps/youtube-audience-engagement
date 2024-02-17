import { sequelizeTest } from '../../models/sequelizeTest';
import YouTubeService from './../youtubeService';

describe('YouTubeService', () => {
  let youtubeService: YouTubeService;

  beforeAll(async () => {
    await sequelizeTest.sync({ force: true });
    youtubeService = new YouTubeService(sequelizeTest);
  });

  afterAll(async () => {
    await sequelizeTest.close();
  });

  test('tests the whole flow', async () => {
    const channel = await youtubeService.createChannel(
      'https://www.youtube.com/@beinghonest',
    );

    expect(channel.youtubeId).toEqual('UCbrgKz68f3NvLr7p3Oiw9nA');

    const videos = await youtubeService.fetchAndSaveVideos(channel);

    expect(videos.length).toBeGreaterThan(0);

    const comments = await youtubeService.fetchAndSaveComments(videos);

    expect(comments.length).toBeGreaterThan(0);

    const commentsInDb = await youtubeService.fetchCommentsByChannelId(
      channel.id,
    );

    expect(commentsInDb.length).toEqual(comments.length);
  });
});

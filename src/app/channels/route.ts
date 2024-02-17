import YouTubeService from '../services/youtubeService';
import { sequelize } from '../models/sequelize';

export async function POST(request: Request) {
  const youtubeService = new YouTubeService(sequelize);
  const requestBody = await request.json();
  try {
    const { channelUrl } = requestBody;
    const channel = await youtubeService.createChannel(channelUrl);
    const videos = await youtubeService.fetchAndSaveVideos(channel);
    await youtubeService.fetchAndSaveComments(videos);

    return Response.json({
      channelId: channel.id,
      message: 'Channel processed successfully',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Failed to process channel:', error.message);
    return Response.json({
      message: 'Failed to process channel',
      error: error.message,
    });
  }
}

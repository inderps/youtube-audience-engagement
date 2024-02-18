import { google, youtube_v3 } from 'googleapis';
import Channel from '../models/channel';
import Video from '../models/video';
import Comment from '../models/comment';
import { Sequelize } from 'sequelize-typescript';
import { channelId as getYoutubeId } from '@gonetone/get-youtube-id-by-url';

export default class YouTubeService {
  private sequelize: Sequelize;
  private youtube: youtube_v3.Youtube;

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize;
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  async createChannel(url: string): Promise<Channel> {
    const youtubeId = await getYoutubeId(url);
    const channel = await this.sequelize
      .getRepository(Channel)
      .create({ youtubeId });
    return channel;
  }

  async fetchAndSaveVideos(channel: Channel): Promise<Video[]> {
    let videos: Video[] = [];
    const response = await this.youtube.search.list({
      part: ['snippet'],
      channelId: channel.youtubeId,
      maxResults: 10,
      // maxResults: 10,
      order: 'date',
    });

    const items = response.data.items;

    if (items) {
      const createVideoPromises = items.map(
        async (item: youtube_v3.Schema$SearchResult) => {
          const video = await Video.create({
            youtubeId: item.id?.videoId || '',
            name: item.snippet?.title || '',
            channelId: channel.id,
          });

          return video;
        },
      );

      videos = await Promise.all(createVideoPromises);
    }

    return videos;
  }

  async fetchAndSaveComments(videos: Video[]): Promise<Comment[]> {
    const createCommentPromises: Promise<Comment>[] = [];

    const fetchCommentsPromises = videos.map(async (video) => {
      const response = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId: video.youtubeId,
        maxResults: 30,
      });

      const items = response.data.items;

      if (items) {
        items.forEach((item) => {
          if (item.snippet?.topLevelComment?.snippet?.textDisplay) {
            createCommentPromises.push(
              Comment.create({
                text: item.snippet.topLevelComment.snippet.textDisplay,
                videoId: video.id,
                channelId: video.channelId,
              }),
            );
          }
        });
      }
    });

    await Promise.all(fetchCommentsPromises);

    const comments = await Promise.all(createCommentPromises);

    return comments;
  }

  async fetchCommentsByChannelId(channelId: number): Promise<Comment[]> {
    const comments = await Comment.findAll({
      include: [
        {
          model: Video,
          where: { channelId },
          required: true, // Only include comments from videos that match the filter
        },
      ],
    });

    return comments;
  }
}

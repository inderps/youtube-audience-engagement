import { google, youtube_v3 } from 'googleapis';
import Channel from '../models/channel';
import Video from '../models/video';
import { Sequelize } from 'sequelize-typescript';
import { channelId as getYoutubeId } from '@gonetone/get-youtube-id-by-url';
// import Video from '../models/video';
// import Comment from '../models/comment';
// import sequelize from '@/app/models/sequelize';

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
    const channel = await this.sequelize.getRepository(Channel).create({ youtubeId });
    return channel;
  }

  async fetchAndSaveVideos(channel: Channel): Promise<Video[]> {
    let videos: Video[] = [];
    const response = await this.youtube.search.list({
      part: ['snippet'],
      channelId: channel.youtubeId,
      maxResults: 10,
      order: 'date',
    });

    const items = response.data.items;

    if (items) {

      const createVideoPromises = items.map(async (item: youtube_v3.Schema$SearchResult) => {
        const video = await Video.create({
          youtubeId: item.id?.videoId || '',
          name: item.snippet?.title || '',
          channelId: channel.id,
        });

        return video;
      });

      videos = await Promise.all(createVideoPromises);
    }

    return videos;
  }
}

// export class YouTubeService {
//   static async createChannel(youtubeId: string): Promise<Channel> {
//     const channel = await Channel.create({ youtubeId });
//     return channel;
//   }

//   static async fetchAndSaveVideos(channelId: string): Promise<void> {
//     const response = await youtube.search.list({
//       // part: 'snippet',
//       channelId,
//       maxResults: 10,
//       order: 'date',
//     });

//     console.log(response.data.items);

//     // const channel = await Channel.findOne({ where: { youtubeId: channelId } });
//     // if (!channel) throw new Error('Channel not found');

//     // if (!response.data?.items) return;

//     // response.data.items.forEach(async (item) => {
//     //   if (!item.id || !item.snippet) return;

//     //   await Video.create({
//     //     youtubeId: item.id.videoId,
//     //     name: item.snippet.title,
//     //     channelId: channel.id,
//     //   });
//     // });
//   }

//   static async fetchAndSaveComments(videoId: string): Promise<void> {
//     // const response = await youtube.commentThreads.list({
//     //   part: 'snippet',
//     //   videoId,
//     //   maxResults: 100,
//     // });

//     // const video = await Video.findOne({ where: { youtubeId: videoId } });
//     // if (!video) throw new Error('Video not found');

//     // response.data.items.forEach(async (item) => {
//     //   await Comment.create({
//     //     text: item.snippet.topLevelComment.snippet.textDisplay,
//     //     videoId: video.id,
//     //     channelId: video.channelId,
//     //   });
//     // });
//   }
// }

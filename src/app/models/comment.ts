import { Table, Column, Model, ForeignKey, BelongsTo, DataType } from 'sequelize-typescript';
import Video from './video';
import Channel from './channel';

@Table
export default class Comment extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text!: string;

  @ForeignKey(() => Video)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  videoId!: number;

  @BelongsTo(() => Video)
  video!: Video;

  @ForeignKey(() => Channel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelId!: number;

  @BelongsTo(() => Channel)
  channel!: Channel;
}

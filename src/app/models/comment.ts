import { Table, Column, Model, ForeignKey, BelongsTo, HasMany, DataType } from 'sequelize-typescript';
import Channel from './channel';
import Video from './video';

@Table
export default class Comment extends Model {
  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  text!: Text;

  @ForeignKey(() => Video)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  videoId!: number;

  @ForeignKey(() => Channel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  channelId!: number;

  @BelongsTo(() => Channel)
  channel!: Channel;

  @BelongsTo(() => Video)
  video!: Video;
}

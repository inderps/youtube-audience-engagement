import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
  DataType,
} from 'sequelize-typescript';
import Channel from './channel';
import Comment from './comment';

@Table
export default class Video extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  youtubeId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @ForeignKey(() => Channel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  channelId!: number;

  @BelongsTo(() => Channel)
  channel!: Channel;

  @HasMany(() => Comment)
  comments!: Comment[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  sentimentsForVideo!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  topVideoRequests!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  faqInsideComments!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  emotionalTone!: string;
}

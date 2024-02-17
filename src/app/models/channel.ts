import { Table, Column, Model, HasMany, DataType } from 'sequelize-typescript';
import Video from './video';
import Comment from './comment';

@Table
export default class Channel extends Model {
  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  youtubeId!: string;

  @HasMany(() => Video)
  videos!: Video[];

  @HasMany(() => Comment)
  comments!: Comment[];
}

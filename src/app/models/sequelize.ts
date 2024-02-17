import { Sequelize } from 'sequelize-typescript';
import pg from 'pg';
import Channel from './channel';
import Video from './video';
import Comment from './comment';

export const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://user:password@db:5432/dbname',
  {
    dialect: 'postgres',
    dialectModule: pg,
    models: [Channel, Video, Comment],
    logging: false,
  },
);

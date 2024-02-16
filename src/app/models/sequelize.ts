import { Sequelize } from 'sequelize-typescript';
import Channel from './channel';
import Video from './video';
// import Comment from './models/Comment';

export const sequelizeTest = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  models: [Channel, Video],
  logging: false,
});

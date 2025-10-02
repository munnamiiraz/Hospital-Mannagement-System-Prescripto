import { Schema, model, Document } from 'mongoose';
import { IUser } from './user.model';

export interface IComplain extends Document {
  user: IUser;
  avatar?: {
    url: string;
    publicId: string;
  };
  content: string,
  feedback?: string,
  createdAt: Date;
  updatedAt: Date;
}

const complainSchema = new Schema<IComplain>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
  },
  avatar: {
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png',
    },
    publicId: {
      type: String,
      default: 'default-avatar',
    },
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
  },
  feedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const Complain = model<IComplain>('Complain', complainSchema);

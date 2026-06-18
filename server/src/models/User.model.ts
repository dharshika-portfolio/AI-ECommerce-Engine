import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Transform _id to id and remove __v on res.json()
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
  }
});

export const User = mongoose.model<IUser>('User', userSchema);

import mongoose, { Schema, model } from 'mongoose';

// Definir la interfaz de Usuario
export interface IUser {
  name: string;
  email: string;
  avatar?: string;
  projects?: mongoose.Types.ObjectId[]; // Proyectos referenciados
  _id?: mongoose.Types.ObjectId;
}

// Esquema de Usuario con proyectos referenciados
const userSchema = new Schema<IUser>({
  _id: { type: mongoose.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Generar un nuevo ObjectId por defecto
  name: { type: String, required: true },
  email: { type: String, required: true },
  avatar: String,
  projects: [{ type: mongoose.Types.ObjectId, ref: 'Project' }] // Referencia al modelo Project
});

export const UserModel = model('User', userSchema);
import mongoose, { Schema, model } from 'mongoose';

export interface IProject {
  _id: mongoose.Types.ObjectId;
  name: string;
  description: string;
  creator: mongoose.Types.ObjectId; // Añadir el campo creator
}

const projectSchema = new Schema<IProject>({
  _id: { type: Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() }, // Generar un nuevo ObjectId por defecto
  name: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Referencia al modelo User
});

export const ProjectModel = model('Project', projectSchema);
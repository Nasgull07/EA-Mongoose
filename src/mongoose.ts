import mongoose, { Schema } from 'mongoose';
import { UserModel, IUser } from './user.js';
import { ProjectModel, IProject } from './project.js';

async function main() {
  mongoose.set('strictQuery', true); // Mantiene el comportamiento actual

  await mongoose.connect('mongodb://127.0.0.1:27017/test')
    .then(() => console.log('Conectado a MongoDB'))
    .catch(err => console.error('Error al conectar:', err));

  async function createUser(name: string, email: string, avatar?: string): Promise<IUser> {
    const user = new UserModel({ name, email, avatar });
    return await user.save();
  }

  async function createProject(name: string, description: string, creator: mongoose.Types.ObjectId): Promise<IProject> {
    const project = new ProjectModel({ name, description, creator });
    return await project.save();
  }

  async function getUserByName(name: string): Promise<IUser | null> {
    return await UserModel.findOne({ name });
  }

  async function deleteUserByName(name: string): Promise<IUser | null> {
    return await UserModel.findOneAndDelete({ name });
  }

  async function updateUserByName(name: string, email: string, avatar: string, projects?: mongoose.Types.ObjectId[]): Promise<IUser | null> {
    return await UserModel.findOneAndUpdate(
      { name },
      { email, avatar, $push: { projects: { $each: projects || [] } } },
      { new: true }
    );
  }

  async function getAllUsers(): Promise<IUser[]> {
    return await UserModel.find();
  }

  async function deleteAllUsers(): Promise<void> {
    await UserModel.deleteMany({});
  }

  async function deleteAllProjects(): Promise<void> {
    await ProjectModel.deleteMany({});
  }

  async function getUserWithProjects(name: string) {
    return await UserModel.aggregate([
      { $match: { name } }, // Filtra el usuario
      {
        $lookup: {
          from: 'projects',
          localField: 'projects',
          foreignField: '_id',
          as: 'projects'
        }
      },
      { $unwind: '$projects' },
      {
        $lookup: {
          from: 'users',
          localField: 'projects.creator',
          foreignField: '_id',
          as: 'projects.creator'
        }
      },
      { $unwind: '$projects.creator' },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          email: { $first: '$email' },
          avatar: { $first: '$avatar' },
          projects: { $push: '$projects' },
          __v: { $first: '$__v' }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          projects: {
            _id: 1,
            name: 1,
            description: 1,
            creator: {
              _id: 1,
              name: 1
            },
            __v: 1
          },
          __v: 1
        }
      }
    ]);
  }

  // Tests de las funciones
  await deleteAllUsers();
  await deleteAllProjects();
  const usuario = await createUser("Pol", "gmail@gmail.com", "1234");
  if (usuario._id) {
    const project = await createProject("Proyecto1", "Descripcion1", usuario._id);
    await updateUserByName("Pol", "gmail@gmail.com", "1234", [project._id]);
  }

  const userWithProjects = await UserModel.findOne({ name: "Pol" }).populate({
    path: 'projects',
    populate: {
      path: 'creator',
      select: 'name'
    }
  });
  console.log("Usuario con proyectos:", JSON.stringify(userWithProjects, null, 2));

  console.log("Usuario con Aggregation Pipeline:", JSON.stringify(await getUserWithProjects("Pol"), null, 2));

  await deleteUserByName("Pol");

  console.log("Después de eliminar:", await getUserByName("Pol"));

  await mongoose.disconnect();
}

main();
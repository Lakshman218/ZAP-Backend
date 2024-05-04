import mongoose, {Schema} from "mongoose";
import admin from './adminTypes'

const adminSchema :Schema = new Schema<admin>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImg: {
    type: String,
    default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm0I8gC3EZZ894dIRJPjTYIcu-nRhxf_0C9A&s',
  }
})

const Admin = mongoose.model<admin>('Admin', adminSchema)
export default Admin
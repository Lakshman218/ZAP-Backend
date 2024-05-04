import mongoose, {Schema} from "mongoose"
import user, { Gender } from './userTypes'


const userSchema: Schema = new Schema<user>({
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  profileImg: {
    type: String,
    default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm0I8gC3EZZ894dIRJPjTYIcu-nRhxf_0C9A&s',
  },
  bio: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    enum: Object.values(Gender)
  },
  // savedPost: {
  //   type: [{type: Schema.Types.ObjectId,}]
  // },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isGoogle: {
    type: Boolean,
    default: false
  } 
},{timestamps: true});

const User = mongoose.model<user>('User', userSchema);
export default User;
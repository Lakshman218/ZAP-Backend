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
    default: 'zap_user',
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
    default: 'https://img.freepik.com/premium-vector/people-saving-money_24908-51569.jpg?w=740',
    // default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTm0I8gC3EZZ894dIRJPjTYIcu-nRhxf_0C9A&s',
  },
  bio: {
    type: String,
    default: 'Discovering moments, one post at a time.'
  },
  gender: {
    type: String,
    enum: Object.values(Gender)
  },
  savedPost: {
    type: [{type: Schema.Types.ObjectId, ref: 'Post'}],
    default: [],    
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  isDeleted: {
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
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }, 
  premiumExpiryDate: {
    type: Date
  },
},{timestamps: true});

const User = mongoose.model<user>('User', userSchema);
export default User;
  import { Document } from "mongoose";

    interface adminInterface extends Document{
      name: string,
      email: string,
      password: string,
      profileImg: string,
    }

    export default adminInterface;
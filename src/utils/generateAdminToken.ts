import jwt from "jsonwebtoken";

const generateAdminToken = (id: string): string => {
  console.log("admin id", id);
    return jwt.sign({ id, role: "admin" }, process.env.JWT_SECRET_KEY as string, {
        expiresIn: '30d',
    });
};

export default generateAdminToken;
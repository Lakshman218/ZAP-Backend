import jwt from "jsonwebtoken"

const generateToken = (id: string): string => {
  return jwt.sign({id, role: "user"}, process.env.JWT_SECRET_KEY as string, {
    expiresIn: '30d'
  })
}

export default generateToken
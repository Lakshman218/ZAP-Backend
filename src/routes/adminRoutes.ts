import express from 'express'   
const router = express.Router()

import { LoginController } from '../controllers/adminController'

router.post("/login", LoginController)

export default router
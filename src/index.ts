import express, { Request, Response } from 'express'
import morgan from 'morgan'
import cors from 'cors'
import dotenv from 'dotenv'
import routes from './interface/routes'
import { errorHandler } from './interface/middleware/ErrorHandler'
import { initDb } from './infrastructure/database/postgres'

dotenv.config()

const app = express()

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())

app.use('/api', routes)

app.get('/', (_req: Request, res: Response) => {
  res.send({ message: 'Backend en TypeScript funcionando' })
})

app.use(errorHandler)

const PORT = Number(process.env.PORT) || 5000

async function startServer() {
  try {
    await initDb()

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server:', error)
    process.exit(1)
  }
}

startServer()

export default app

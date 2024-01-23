import express, { Request, Response } from "express"
import dotenv from "dotenv"
dotenv.config()
import bodyParser from "body-parser"
import cors from "cors"
import { Server } from "socket.io"
import Socket from "./socket/socket"
import { notFound, errorHandler } from "./middleware/error-middleware"

const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Collab craft backend 💫💫💫")
})

app.use(errorHandler)
app.use(notFound)

const port = process.env.PORT || 5000
const server = app.listen(port, () =>
  console.log(`Server started on port ${port}`)
)
const ioServer = new Server(server, {
  cors: {
    origin: "*",
  },
})
Socket.getInstance(ioServer)

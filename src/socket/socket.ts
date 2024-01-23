import { Server } from "socket.io"
import supabase from "../supabase/supabase"
import { hasAccess } from "../supabase/queries"

class Socket {
  private static _instance: Socket
  private io: Server
  private constructor(server: Server) {
    this.io = server

    //user token validation is invalid then do not connect
    this.io.use(async (socket, next) => {
      if (!socket.handshake.auth.token) {
        next(new Error("No Authentication token"))
      }

      const token = socket.handshake.auth.token

      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data.user) {
        next(new Error("Authentication Failed"))
      }
      next()
    })

    this.io.on("connection", (socket) => {
      socket.on("create-room", async (fileId, fileType, userId) => {
        if (!fileId || !fileType || !userId) {
          socket.emit("error", "Invalid parameters")
        }
        //returns to fileID in data if the user has access to it
        const { data, error } = await hasAccess(fileId, fileType, userId)
        if (error) {
          socket.emit("error", error)
        }
        if (!data) {
          socket.emit("error", "Cannot verify the access to the file")
        } else {
          socket.join(data)
        }
      })

      socket.on("send-changes", (deltas, fileId) => {
        socket.broadcast.to(fileId).emit("receive-changes", deltas, fileId)
      })

      socket.on("send-cursor-move", (range, fileId, cursorId) => {
        socket.broadcast
          .to(fileId)
          .emit("receive-cursor-move", range, fileId, cursorId)
      })
    })
  }

  static getInstance(server?: Server) {
    if (this._instance) {
      return this._instance
    }

    if (server) {
      this._instance = new Socket(server)
      this._instance
    }

    return Error("Failed to init socket")
  }
}

export default Socket

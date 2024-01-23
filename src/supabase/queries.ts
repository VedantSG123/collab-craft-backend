import { files, folders, workspaces } from "../migrations/schema"
import { eq, and } from "drizzle-orm"
import db from "./db"
import { workspace } from "./supabase.types"

export const hasAccess = async (
  fileId: string,
  fileType: "file" | "folder" | "workspace",
  userId: string
) => {
  try {
    let roomId: string | null = null
    let userWorkspace: workspace | null = null

    //file
    if (fileType === "file") {
      //get file
      const file = await db.select().from(files).where(eq(files.id, fileId))
      if (!file || file.length === 0) {
        return { data: null, error: "Cannot find the requested file" }
      }

      //get folder
      const folder = await db
        .select()
        .from(folders)
        .where(eq(folders.id, file[0].folderId))
      if (!folder || folder.length === 0) {
        return { data: null, error: "Cannot find the requested file" }
      }

      //get workspace
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, folder[0].workspaceId))
      if (!workspace || workspace.length === 0) {
        return { data: null, error: "Cannot find the requested file" }
      }
      userWorkspace = workspace[0]
      roomId = file[0].id
    }

    //folder
    if (fileType === "folder") {
      //get folder
      const folder = await db
        .select()
        .from(folders)
        .where(eq(folders.id, fileId))
      if (!folder || folder.length === 0) {
        return { data: null, error: "Cannot find the requested file" }
      }

      //get workspace
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, folder[0].workspaceId))
      if (!workspace || workspace.length === 0) {
        return { data: null, error: "Cannot find the requested file" }
      }

      userWorkspace = workspace[0]
      roomId = folder[0].id
    }

    //workspace
    if (fileType === "workspace") {
      //get workspace
      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, fileId))
      if (!workspace || workspace.length === 0) {
        return { data: null, error: "Cannot find the requested file" }
      }

      userWorkspace = workspace[0]
      roomId = workspace[0].id
    }

    if (userWorkspace === null || roomId === null) {
      return { data: null, error: "File not found" }
    }

    //check if collaborator or creator
    if (userId === userWorkspace.workspaceOwner) {
      return { data: roomId, error: null }
    }

    const collaborator = await db.query.collaborators.findFirst({
      where: (c, { eq }) =>
        and(
          eq(c.workspaceId, userWorkspace?.id as string),
          eq(c.userId, userId)
        ),
    })

    if (!collaborator) {
      return { data: null, error: "Access to the file is denied" }
    }

    return { data: roomId, error: null }
  } catch (err) {
    return { data: null, error: err }
  }
}

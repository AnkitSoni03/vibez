import { Client, Databases, Storage, ID, Query, Permission, Role } from "appwrite";
import conf from "../conf/conf";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);

    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  // CREATE POST
  async createPost({ Title, Content, "Unique-image": imageId, Status, UserId }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        ID.unique(),
        { Title, Content, "Unique-image": imageId, Status, UserId }
      );
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  // UPDATE POST
  async updatePost(documentId, { Title, Content, "Unique-image": imageId, Status }) {
    try {
      return await this.databases.updateDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId,
        { Title, Content, "Unique-image": imageId, Status }
      );
    } catch (error) {
      console.error("Error updating post:", error);
      throw error;
    }
  }

  // DELETE POST
  async deletePost(documentId) {
    try {
      await this.databases.deleteDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId
      );
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  // GET SINGLE POST
  async getPost(documentId) {
    try {
      return await this.databases.getDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        documentId
      );
    } catch (error) {
      console.error("Error getting post:", error);
      return null;
    }
  }

  // GET ALL POSTS
  async getAllPosts(status = "active") {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [Query.equal("Status", status)]
      );
    } catch (error) {
      console.error("Error getting all posts:", error);
      return { documents: [] };
    }
  }

  // GET POSTS FOR LOGGED-IN USER
  async getPosts(userId) {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        [Query.equal("UserId", userId)]
      );
    } catch (error) {
      console.error("Error getting user's posts:", error);
      return { documents: [] };
    }
  }

  async uploadFile(file) {
    try {
      return await this.bucket.createFile(
        conf.appwriteBucketId,
        ID.unique(),
        file,
        [Permission.read(Role.any())] 
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  // DELETE FILE
  async deleteFile(fileId) {
    try {
      return await this.bucket.deleteFile(conf.appwriteBucketId, fileId);
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }
  getFilePreview(fileId) {
    return this.bucket.getFileView(conf.appwriteBucketId, fileId).toString();
  }
}

const appwriteService = new Service();
export default appwriteService;

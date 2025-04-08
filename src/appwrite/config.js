import { Client, Databases, Storage, ID, Query, Permission, Role } from "appwrite";
import conf from "../conf/conf";

export class Service {
  client = new Client();
  databases;
  bucket;

  constructor() {
    this.client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
    this.bucket = new Storage(this.client);
  }

  // ------------------- POSTS -------------------

  async createPost({ Title, Content, "Unique-image": imageId, Status, UserId, UserName }) {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCollectionId,
        ID.unique(),
        { Title, Content, "Unique-image": imageId, Status, UserId, UserName }
      );
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

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

  async deletePost(documentId) {
    try {
      await this.databases.deleteDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, documentId);
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      return false;
    }
  }

  async getPost(documentId) {
    try {
      return await this.databases.getDocument(conf.appwriteDatabaseId, conf.appwriteCollectionId, documentId);
    } catch (error) {
      console.error("Error getting post:", error);
      return null;
    }
  }

  async getAllPosts(status = "active") {
    try {
      return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, [
        Query.equal("Status", status),
        Query.orderDesc("$createdAt"),
      ]);
    } catch (error) {
      console.error("Error getting all posts:", error);
      return { documents: [] };
    }
  }

  async getPosts(userId) {
    try {
      return await this.databases.listDocuments(conf.appwriteDatabaseId, conf.appwriteCollectionId, [
        Query.equal("UserId", userId),
      ]);
    } catch (error) {
      console.error("Error getting user's posts:", error);
      return { documents: [] };
    }
  }

  // ------------------- FILES -------------------

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

  // ------------------- COMMENTS -------------------

  addComment = async (postId, userId, username, content) => {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        ID.unique(),
        {
          postId,
          userId,
          username,
          content,
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  };

  getComments = async (postId) => {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,
        conf.appwriteCommentsCollectionId,
        [
          Query.equal("postId", postId),
          Query.orderDesc("timestamp"),
        ]
      );
    } catch (error) {
      console.error("Error fetching comments:", error);
      return { documents: [] };
    }
  };

  // Add these methods to your Service class in config.js

// ------------------- NOTIFICATIONS -------------------
createNotification = async ({ userId, type, message, postId, commentId = null }) => {
  try {
    return await this.databases.createDocument(
      conf.appwriteDatabaseId,
      'notifications', // Make sure this collection exists
      ID.unique(),
      {
        userId,
        type,
        message,
        postId,
        commentId,
        read: false,
      }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

getUserNotifications = async (userId) => {
  try {
    return await this.databases.listDocuments(
      conf.appwriteDatabaseId,
      'notifications',
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(20)
      ]
    );
  } catch (error) {
    console.error("Error getting notifications:", error);
    return { documents: [] };
  }
};

markNotificationAsRead = async (notificationId) => {
  try {
    return await this.databases.updateDocument(
      conf.appwriteDatabaseId,
      'notifications',
      notificationId,
      { read: true }
    );
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

  // ------------------- LIKES -------------------

  likePost = async (postId, userId) => {
    try {
      return await this.databases.createDocument(
        conf.appwriteDatabaseId,  // Fixed: Changed from conf.databaseId
        conf.likesCollectionId,
        ID.unique(),
        {
          postId,
          userId,
        }
      );
    } catch (error) {
      console.error("Error liking post:", error);
      throw error;
    }
  };

  unlikePost = async (postId, userId) => {
    try {
      const res = await this.databases.listDocuments(
        conf.appwriteDatabaseId,  // Fixed: Changed from conf.databaseId
        conf.likesCollectionId,
        [
          Query.equal("postId", postId),
          Query.equal("userId", userId),
        ]
      );

      if (res.documents.length > 0) {
        await this.databases.deleteDocument(
          conf.appwriteDatabaseId,  // Fixed: Changed from conf.databaseId
          conf.likesCollectionId,
          res.documents[0].$id
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error unliking post:", error);
      throw error;
    }
  };

  getLikes = async (postId) => {
    try {
      return await this.databases.listDocuments(
        conf.appwriteDatabaseId,  // Fixed: Changed from conf.databaseId
        conf.likesCollectionId,
        [Query.equal("postId", postId)]
      );
    } catch (error) {
      console.error("Error getting likes:", error);
      return { documents: [] };
    }
  };



  
}

const appwriteService = new Service();
export default appwriteService;
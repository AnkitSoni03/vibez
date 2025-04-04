import conf from '../conf/conf';
import { Client, Account, ID } from "appwrite";

export class AuthService {
    client = new Client();
    account;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.account = new Account(this.client);
    }

    async createAccount({email, password, name}) {
        try {
            const userAccount = await this.account.create(
                ID.unique(),
                email,
                password,
                name
            );
            
            if (userAccount) {
                // Automatically log in after successful account creation
                const session = await this.login({email, password});
                if (!session) throw new Error('Failed to create login session');
                return session;
            }
            throw new Error('Account creation failed');
        } catch (error) {
            console.error("Appwrite :: createAccount :: error", error);
            throw new Error(error.message || 'Failed to create account');
        }
    }

    async login({email, password}) {
        try {
            return await this.account.createEmailPasswordSession(email, password);
        } catch (error) {
            console.error("Appwrite :: login :: error", error);
            throw new Error(error.message || 'Login failed. Please check your credentials');
        }
    }

    async getCurrentUser() {
        try {
            const user = await this.account.get();
            console.log("Fetched User:", user);  // ✅ Debugging step
            return user;
        } catch (error) {
            console.error("Appwrite service :: getCurrentUser :: error", error);
            return null;
        }
    }
    
    async logout() {
        try {
            await this.account.deleteSessions();
            return true;
        } catch (error) {
            console.error("Appwrite :: logout :: error", error);
            return false;
        }
    }

    async sendVerificationEmail() {
        try {
            return await this.account.createVerification(
                `${window.location.origin}/verify`
            );
        } catch (error) {
            console.error("Appwrite :: sendVerificationEmail :: error", error);
            throw error;
        }
    }

    async verifyEmail(userId, secret) {
        try {
            return await this.account.updateVerification(userId, secret);
        } catch (error) {
            console.error("Appwrite :: verifyEmail :: error", error);
            throw error;
        }
    }

    async sendPasswordResetEmail(email) {
        try {
            return await this.account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
        } catch (error) {
            console.error("Appwrite :: sendPasswordResetEmail :: error", error);
            throw error;
        }
    }

    async updatePassword(userId, secret, newPassword) {
        try {
            return await this.account.updateRecovery(
                userId,
                secret,
                newPassword,
                newPassword
            );
        } catch (error) {
            console.error("Appwrite :: updatePassword :: error", error);
            throw error;
        }
    }
}

const authService = new AuthService();
export default authService;
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import appwriteService from "../appwrite/config";
import { Button, Container, Loader } from "../components";
import parse from "html-react-parser";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function Post() {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const { slug } = useParams();
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);
    const isAuthor = post && userData ? post.userId === userData.$id : false;

    useEffect(() => {
        const fetchPost = async () => {
            try {
                if (slug) {
                    const postData = await appwriteService.getPost(slug);
                    if (postData) {
                        setPost(postData);
                    } else {
                        navigate("/");
                    }
                } else {
                    navigate("/");
                }
            } catch (error) {
                console.error("Failed to fetch post:", error);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug, navigate]);

    const deletePost = async () => {
        try {
            const status = await appwriteService.deletePost(post.$id);
            if (status) {
                await appwriteService.deleteFile(post.featuredImage);
                navigate("/");
            }
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return post ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-900 py-12"
        >
            <Container>
                <div className="max-w-4xl mx-auto">
                    <div className="relative mb-8 rounded-xl overflow-hidden border border-gray-700">
                        <img
                            src={appwriteService.getFilePreview(post.featuredImage)}
                            alt={post.title}
                            className="w-full h-96 object-cover"
                        />
                        {isAuthor && (
                            <div className="absolute right-6 top-6 flex space-x-3">
                                <Link to={`/edit-post/${post.$id}`}>
                                    <Button 
                                        bgColor="bg-green-600 hover:bg-green-700"
                                        className="px-4 py-2"
                                    >
                                        Edit
                                    </Button>
                                </Link>
                                <Button 
                                    bgColor="bg-red-600 hover:bg-red-700"
                                    onClick={deletePost}
                                    className="px-4 py-2"
                                >
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
                        <div className="flex items-center text-gray-400">
                            <span className="mr-4">
                                {new Date(post.$createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                        {parse(post.content)}
                    </div>
                </div>
            </Container>
        </motion.div>
    ) : null;
}
import React, { useEffect, useState } from 'react';
import { Container, PostForm, Loader } from '../components';
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

function EditPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (slug) {
          const postData = await appwriteService.getPost(slug);
          if (postData) {
            setPost(postData);
          } else {
            navigate('/');
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error("Failed to fetch post:", error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate]);

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
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-xl shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-8 border-b border-indigo-500 pb-2">
            Edit Post
          </h1>
          <PostForm post={post} />
        </div>
      </Container>
    </motion.div>
  ) : null;
}

export default EditPost;
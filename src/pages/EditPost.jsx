import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import appwriteService from "../appwrite/config";
import PostForm from "../components/post-form/PostForm";
import Loader from "../components/Loader";

function EditPost() {
  const { id } = useParams(); // post.$id
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      appwriteService.getPost(id).then((res) => {
        if (res) {
          setPost(res);
        }
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (updatedPost) => {
    try {
      const file = updatedPost.image[0]
        ? await appwriteService.uploadFile(updatedPost.image[0])
        : null;

      if (file) {
        // delete old image
        await appwriteService.deleteFile(post["Unique-image"]);
      }

      const dbPost = await appwriteService.updatePost(id, {
        Title: updatedPost.title,
        Content: updatedPost.content,
        Status: "active",
        "Unique-image": file ? file.$id : post["Unique-image"],
      });

      if (dbPost) {
        navigate(`/post/${dbPost.$id}`);
      }
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  if (loading) return <Loader />;

  if (!post) {
    return <div className="text-center text-red-500 text-xl mt-10">Post not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-white mb-6 text-center">Edit Post</h2>
      <PostForm
        post={{
          title: post.Title,
          content: post.Content,
          image: post["Unique-image"],
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default EditPost;

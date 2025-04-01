import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues, formState: { errors } } = useForm({
    defaultValues: {
      title: post?.title || "",
      slug: post?.$id || "",
      content: post?.content || "",
      status: post?.status || "active",
    },
  });

  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const submit = async (data) => {
    try {
      if (post) {
        // Update existing post
        const file = data.image[0] ? await appwriteService.uploadFile(data.image[0]) : null;

        if (file) {
          await appwriteService.deleteFile(post.featuredImage);
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : post.featuredImage,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
      } else {
        // Create new post
        const file = await appwriteService.uploadFile(data.image[0]);

        if (file) {
          const dbPost = await appwriteService.createPost({
            ...data,
            featuredImage: file.$id,
            userId: userData.$id,
          });

          if (dbPost) {
            navigate(`/post/${dbPost.$id}`);
          }
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string") {
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");
    }
    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Input
              label="Title"
              placeholder="Enter post title"
              {...register("title", { required: "Title is required" })}
              error={errors.title?.message}
              darkMode
            />
            
            <Input
              label="Slug"
              placeholder="Post slug"
              {...register("slug", { required: "Slug is required" })}
              onInput={(e) => {
                setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true });
              }}
              error={errors.slug?.message}
              darkMode
            />
            
            <div className="bg-gray-800 rounded-lg p-1">
              <RTE 
                label="Content" 
                name="content" 
                control={control} 
                defaultValue={getValues("content")} 
                darkMode
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <Input
                label="Featured Image"
                type="file"
                accept="image/png, image/jpg, image/jpeg, image/gif"
                {...register("image", { required: !post && "Image is required" })}
                error={errors.image?.message}
                darkMode
              />
              
              {post?.featuredImage && (
                <div className="mt-4">
                  <img
                    src={appwriteService.getFilePreview(post.featuredImage)}
                    alt={post.title}
                    className="rounded-lg w-full h-auto max-h-48 object-cover"
                  />
                  <p className="text-xs text-gray-400 mt-1">Current featured image</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <Select
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
                label="Status"
                {...register("status", { required: "Status is required" })}
                error={errors.status?.message}
                darkMode
              />
            </div>
            
            <Button
              type="submit"
              className="w-full"
              bgColor={post ? "bg-indigo-600 hover:bg-indigo-700" : "bg-green-600 hover:bg-green-700"}
            >
              {post ? "Update Post" : "Publish Post"}
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
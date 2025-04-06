import React, { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function PostForm({ post }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Title: post?.Title || "",
      slug: post?.$id || "",
      Content: post?.Content || "",
      Status: post?.Status || "draft",
      image: null,
    },
  });

  const slugTransform = useCallback((value) => {
    return value
      ? value.trim().toLowerCase().replace(/[^a-zA-Z\d\s]+/g, "-").replace(/\s+/g, "-")
      : "";
  }, []);

  useEffect(() => {
    const titleSub = watch(({ Title }, { name }) => {
      if (name === "Title") setValue("slug", slugTransform(Title), { shouldValidate: true });
    });
    return () => titleSub.unsubscribe();
  }, [watch, slugTransform, setValue]);

  const submit = async (data) => {
    try {
      if (!userData?.$id) throw new Error("You must be logged in to create posts");

      let file = null;
      if (data.image[0]) {
        file = await appwriteService.uploadFile(data.image[0]);
      }

      if (post) {
        // Update
        if (file) {
          await appwriteService.deleteFile(post["Unique-image"]);
        }

        const updatedPost = await appwriteService.updatePost(post.$id, {
          Title: data.Title,
          Content: data.Content,
          "Unique-image": file ? file.$id : post["Unique-image"],
          Status: data.Status,
        });

        if (updatedPost) {
          navigate(`/post/${updatedPost.$id}`);
          toast.success("Post updated successfully");
        }
      } else {
        // Create
        if (!file) throw new Error("Image is required");

        const newPost = await appwriteService.createPost({
          Title: data.Title,
          Content: data.Content,
          "Unique-image": file.$id,
          Status: data.Status,
          UserId: userData.$id,
        });

        if (newPost) {
          navigate(`/post/${newPost.$id}`);
          toast.success("Post created successfully");
        }
      }
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error(error.message || "Failed to submit post");
      if (error.message.includes("logged in")) navigate("/login");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <form onSubmit={handleSubmit(submit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Input
              label="Title"
              placeholder="Enter post title"
              {...register("Title", { required: "Title is required" })}
              error={errors.Title?.message}
              darkMode
            />
            <Input
              label="Slug"
              placeholder="Post slug"
              {...register("slug", { required: "Slug is required" })}
              onInput={(e) =>
                setValue("slug", slugTransform(e.currentTarget.value), { shouldValidate: true })
              }
              error={errors.slug?.message}
              darkMode
            />
            <div className="bg-gray-800 rounded-lg p-1">
              <RTE
                label="Content"
                name="Content"
                control={control}
                defaultValue={getValues("Content")}
                darkMode
              />
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <Input
                label="Featured Image"
                type="file"
                accept="image/*"
                {...register("image", {
                  required: !post && "Image is required",
                })}
                error={errors.image?.message}
                darkMode
              />
              {post?.["Unique-image"] && (
                <div className="mt-4">
                  <img
                    src={appwriteService.getFilePreview(post["Unique-image"])}
                    alt={post.Title}
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
                {...register("Status", { required: "Status is required" })}
                error={errors.Status?.message}
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

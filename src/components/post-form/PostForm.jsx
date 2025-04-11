import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  ImagePlus,
  Save,
  Send,
  AlertCircle,
  X,
  ArrowLeft,
  Eye,
} from "lucide-react";

export default function PostForm({ post }) {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [imagePreview, setImagePreview] = useState(
    post?.["Unique-image"]
      ? appwriteService.getFilePreview(post["Unique-image"])
      : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    getValues,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      Title: post?.Title || "",
      slug: post?.$id || "",
      Content: post?.Content || "",
      Status: post?.Status || "draft",
      image: null,
    },
  });

  const watchTitle = watch("Title");
  const watchContent = watch("Content");
  const watchStatus = watch("Status");

  const slugTransform = useCallback((value) => {
    return value
      ? value
          .trim()
          .toLowerCase()
          .replace(/[^a-zA-Z\d\s]+/g, "-")
          .replace(/\s+/g, "-")
      : "";
  }, []);

  useEffect(() => {
    const titleSub = watch(({ Title }, { name }) => {
      if (name === "Title")
        setValue("slug", slugTransform(Title), { shouldValidate: true });
    });
    return () => titleSub.unsubscribe();
  }, [watch, slugTransform, setValue]);

  // Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const submit = async (data) => {
    setIsSubmitting(true);
    try {
      if (!userData?.$id)
        throw new Error("You must be logged in to create posts");

      let file = null;
      if (data.image[0]) {
        file = await appwriteService.uploadFile(data.image[0]);
      }

      if (post) {
        // Update
        if (file && post["Unique-image"]) {
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
        if (!file) throw new Error("Image is required for new posts");

        const newPost = await appwriteService.createPost({
          Title: data.Title,
          Content: data.Content,
          "Unique-image": file.$id,
          Status: data.Status,
          UserId: userData.$id,
          UserName: userData.name,
          UserEmail: userData.email,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    if (isDirty) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?"
        )
      ) {
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto"
    >
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex items-center text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-white">
          {post ? "Edit Post" : "Create New Post"}
        </h1>
        <div className="w-20"></div> {/* Spacer for flexbox alignment */}
      </div>

      {/* Main Form */}
      <div className="bg-gray-900 rounded-xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  watchStatus === "active" ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <span className="text-gray-400 text-sm capitalize">
                {watchStatus} Post
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-sm text-gray-300 transition"
            >
              <Eye size={16} className="mr-1" />
              {previewMode ? "Edit Mode" : "Preview"}
            </button>
          </div>
        </div>

        {previewMode ? (
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                {watchTitle || "Untitled Post"}
              </h1>
              {imagePreview && (
                <div className="w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: watchContent || "<p>No content yet...</p>",
                }}
              />
            </div>
            <Button
              type="button"
              onClick={() => setPreviewMode(false)}
              className="mt-4"
              bgColor="bg-blue-600 hover:bg-blue-700"
            >
              Continue Editing
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(submit)} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Title
                  </label>
                  <input
                    className={`w-full px-4 py-3 bg-gray-800 border ${
                      errors.Title ? "border-red-500" : "border-gray-700"
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white text-lg`}
                    placeholder="Enter an engaging title..."
                    {...register("Title", { required: "Title is required" })}
                  />
                  {errors.Title && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.Title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Slug
                  </label>
                  <div className="flex">
                    <input
                      className={`flex-1 px-4 py-3 bg-gray-800 border ${
                        errors.slug ? "border-red-500" : "border-gray-700"
                      } rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white`}
                      placeholder="your-post-title"
                      {...register("slug", { required: "Slug is required" })}
                      onInput={(e) =>
                        setValue("slug", slugTransform(e.currentTarget.value), {
                          shouldValidate: true,
                        })
                      }
                    />
                  </div>
                  {errors.slug && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-300">
                    Content
                  </label>
                  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <RTE
                      name="Content"
                      control={control}
                      defaultValue={getValues("Content")}
                      darkMode
                      rules={{ required: "Content is required" }}
                    />
                  </div>
                  {errors.Content && (
                    <p className="text-red-500 text-xs flex items-center mt-1">
                      <AlertCircle size={12} className="mr-1" />
                      {errors.Content.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-medium text-white">Featured Image</h3>
                  </div>
                  <div className="p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setValue("image", null);
                          }}
                          className="absolute top-2 right-2 bg-black/70 p-1 rounded-full hover:bg-red-600 transition"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                        <ImagePlus
                          size={32}
                          className="mx-auto text-gray-500 mb-2"
                        />
                        <p className="text-sm text-gray-400 mb-4">
                          Drop your image here, or{" "}
                          <span className="text-blue-400">browse</span>
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="image-upload"
                          {...register("image", {
                            required:
                              !post && "Image is required for new posts",
                            onChange: handleImageChange,
                          })}
                        />
                        <label
                          htmlFor="image-upload"
                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg cursor-pointer transition"
                        >
                          Select Image
                        </label>
                      </div>
                    )}
                    {errors.image && (
                      <p className="text-red-500 text-xs flex items-center mt-3">
                        <AlertCircle size={12} className="mr-1" />
                        {errors.image.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Post Status */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="p-4 border-b border-gray-700">
                    <h3 className="font-medium text-white">Post Settings</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-300">
                        Status
                      </label>
                      <Select
                        options={[
                          { value: "draft", label: "Save as Draft" },
                          { value: "active", label: "Publish Now" },
                          { value: "inactive", label: "Private" },
                        ]}
                        className={`w-full ${
                          errors.Status ? "border-red-500" : "border-gray-700"
                        }`}
                        {...register("Status", {
                          required: "Status is required",
                        })}
                        darkMode
                      />
                      {errors.Status && (
                        <p className="text-red-500 text-xs flex items-center mt-1">
                          <AlertCircle size={12} className="mr-1" />
                          {errors.Status.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col space-y-3">
                  <Button
                    type="submit"
                    className="w-full justify-center py-3"
                    bgColor={
                      post
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-green-600 hover:bg-green-700"
                    }
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {post ? "Updating..." : "Publishing..."}
                      </>
                    ) : (
                      <>
                        {post ? (
                          <>
                            <Save size={18} className="mr-1" />
                            Update Post
                          </>
                        ) : (
                          <>
                            <Send size={18} className="mr-1" />
                            Publish Post
                          </>
                        )}
                      </>
                    )}
                  </Button>
                  <button
                    type="button"
                    onClick={goBack}
                    className="w-full py-2 text-gray-400 hover:text-white transition text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}

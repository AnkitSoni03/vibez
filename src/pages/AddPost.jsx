import React from "react";
import { Container, PostForm } from "../components";

function AddPost() {
  return (
    <div className="py-8">
      <Container>
        <PostForm type="create" />
      </Container>
    </div>
  );
}

export default AddPost;

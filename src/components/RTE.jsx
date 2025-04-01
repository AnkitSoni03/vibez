import React from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Controller } from 'react-hook-form';

export default function RTE({ name, control, label, defaultValue = "", darkMode = true }) {
  return (
    <div className='w-full mb-6'>
      {label && (
        <label className={`block mb-2 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <Controller
        name={name || "content"}
        control={control}
        render={({ field: { onChange } }) => (
          <div className={darkMode ? 'dark-editor' : ''}>
            <Editor
              initialValue={defaultValue}
              init={{
                height: 500,
                menubar: true,
                skin: darkMode ? 'oxide-dark' : 'oxide',
                content_css: darkMode ? 'dark' : 'default',
                plugins: [
                  'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                  'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                ],
                toolbar:
                  'undo redo | blocks | ' +
                  'bold italic forecolor | alignleft aligncenter ' +
                  'alignright alignjustify | bullist numlist outdent indent | ' +
                  'removeformat | help | image',
                images_upload_handler: async (blobInfo) => {
                  // Implement your image upload logic here
                },
                content_style: `
                  body { 
                    font-family:Helvetica,Arial,sans-serif; 
                    font-size:14px; 
                    ${darkMode ? 'background-color: #1f2937; color: #f3f4f6;' : ''}
                  }
                `
              }}
              onEditorChange={onChange}
            />
          </div>
        )}
      />
    </div>
  );
}
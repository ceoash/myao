import React from 'react'
import Heading from '../modals/Heading'
import ImageUpload from '../inputs/ImageUpload'

const AddImages = ({
    saveImages,
    images,
}: {
    saveImages: (value: string) => void;
    images: string;

}) => {
  return (
    <div className="flex flex-col">
        <Heading
          title="Image upload"
          description="Add images to your listing. You can add up to 5 images."
          nounderline
        />
        <div>
          <ImageUpload
            value={images}
            onChange={(value) => saveImages(value)}
          />
        </div>
      </div>
  )
}

export default AddImages
import React from 'react'
import Heading from '../modals/Heading'
import ImageUpload from '../inputs/ImageUpload'
import Button from '../Button';

const AddImages = ({
    saveImages,
    images,
    close
}: {
    saveImages: (value: string) => void;
    images: string;
    close: () => void;

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
        <div className='mt-6'>
            <Button label="Done" onClick={close} />
        </div>
      </div>
  )
}

export default AddImages
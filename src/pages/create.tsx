import axios from 'axios';
import { getSession } from 'next-auth/react';
import { useState } from 'react';

const CreatePage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateListing = async () => {
    setIsLoading(true);

    const session = await getSession();

    try {
      const response = await axios.post('/api/listings', {
        title: 'Dummy Listing',
        description: 'This is a dummy listing',
        price: 100,
        image: 'https://example.com/image.jpg',
        buyerId: session?.user?.id, // Replace with the actual buyerId
      });

      console.log('Listing created:', response.data);
      // Optionally, you can perform any other actions upon successful listing creation
    } catch (error) {
      console.error('Error creating listing:', error);
      // Handle the error or display an error message to the user
    }

    setIsLoading(false);
  };

  return (
    <div>
      <h1>Create Listing</h1>
      <button onClick={handleCreateListing} disabled={isLoading}>
        Create Dummy Listing
      </button>
    </div>
  );
};

export default CreatePage;
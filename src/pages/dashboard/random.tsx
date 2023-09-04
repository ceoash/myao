import { useState } from 'react';

const RandomPicker: React.FC = () => {
  const [min, setMin] = useState<number>(1);
  const [max, setMax] = useState<number>(10);
  const [randomNumber, setRandomNumber] = useState<number | null>(null);

  const generateRandomNumber = () => {
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    setRandomNumber(random);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700">Min:</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className="mt-1 p-2 w-48 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Max:</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(Number(e.target.value))}
            className="mt-1 p-2 w-48 border rounded"
          />
        </div>
        <button
          onClick={generateRandomNumber}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Random Number
        </button>
        {randomNumber !== null && (
          <div className="mt-4 text-xl font-bold">
            Random Number: {randomNumber}
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomPicker;
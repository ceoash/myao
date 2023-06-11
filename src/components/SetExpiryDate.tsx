import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import DatePicker from "react-datepicker";

const SetExpiryDate = ({id}: any) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const router = useRouter();

  const handleSaveDate = async ()  => {
    try {
      await axios.put(`/api/setExpiry`, {
        expiry: selectedDate,
        id: id
      });
      router.refresh();
    } catch (error) {
      console.error('Error updating listing:', error);
      // Handle the error
    }
  };

  return (
    <div className="flex">
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} placeholderText="Select expiry date" />
      {selectedDate && (
        <button onClick={handleSaveDate} className="ml-2 bg-orange-500 px-1 text-sm text-white rounded">
          Save
        </button>
      )}
    </div>
  );
};

export default SetExpiryDate;

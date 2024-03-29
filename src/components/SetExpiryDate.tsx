import axios from "axios";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    }
  };

  return (
    <div className="flex">
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} placeholderText="Select expiry date" />
      {selectedDate && (
        <button onClick={handleSaveDate} className="ml-2 bg-orange-default px-1 text-sm text-white rounded">
          Save
        </button>
      )}
    </div>
  );
};

export default SetExpiryDate;

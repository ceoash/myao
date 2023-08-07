import React, { useState } from "react";
import { cities } from "@/data/locations";
import Button from "./Button";
import { CiLocationOn } from "react-icons/ci";

interface CityProps {
  city?: string | undefined;
  region: string; 
}

interface CityAutocompleteProps { setSelectedCity: React.Dispatch<React.SetStateAction<CityProps>>; selectedCity: CityProps; }

function CityAutocomplete({setSelectedCity, selectedCity}: CityAutocompleteProps) {

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<CityProps[]>([]);
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setInputValue(value);

    if (value.length < 3) {
        setSuggestions([]);
        return;
    }

    const matchedCities = cities
      .filter((city) => city.city.toLowerCase().startsWith(value.toLowerCase()))
      .map((city) => ({ city: city.city, region: city.admin_name }));

    const matchedCounties = cities
      .filter((city) =>
        city.admin_name.toLowerCase().startsWith(value.toLowerCase())
      )
      .map((city) => ({ city: "", region: city.admin_name }));

    const combinedMatches = [...matchedCities, ...matchedCounties];

    const uniqueMatches = combinedMatches.filter( 
        (v, i, a) => a.findIndex((t) => t.city === v.city && t.region === v.region) === i 
    );

    const sortedMatches = uniqueMatches.sort((a, b) => {
      if (a.city === b.city) { return a.region.localeCompare(b.region) }
      return a.city.localeCompare(b.city);
    });

    setSuggestions(sortedMatches);
  }

  function handleCityClick(city: any) {
    setSelectedCity(city);
    setInputValue(city);
    setSuggestions([]);
  }

  return (
    <div>
        <label htmlFor="" className="mb-2">
            Location of the item <span className="italic text-gray-500 text-sm ">(Optional)</span>
        </label>
      {selectedCity?.region || selectedCity?.city ? (
        <div className="mt-3">
          <div className="flex justify-between rounded-xl border border-200 p-2 items-center bg-gray-50">
            <div className="text-sm text-gray-600 flex items-center gap-1">
                <span className="font-bold"><CiLocationOn /></span>
              <span className={selectedCity?.city ? "italic" : "font-bold"}>
                {selectedCity?.region && selectedCity.region}
              </span>
              <span
                className={
                  selectedCity?.city && selectedCity.city ? "" : "hidden"
                }
              >
                |
              </span>
              <span className="font-bold">
                {selectedCity?.city && selectedCity.city}
              </span>
            </div>
            <Button onClick={() => (setSelectedCity({ region: "", city: "" }), setInputValue(''))}>
              Change
            </Button>
          </div>
        </div>
      ) : (
        <div className="relative mt-2">
          <input
            type="text"
            value={inputValue}
            onChange={handleChange}
            placeholder="Start typing a location..."
            className="w-full rounded-lg p-3 border border-gray-200 focus:outline-none focus:border-orange-300"
          />
          {suggestions && suggestions.length > 0 && (
          <ul className="mt-3 absolute top-full bg-gray-50 rounded-lg border border-gray-200 shadow p-2 w-full  z-20">
            {suggestions?.map((city) => (
              <li
                key={city.region + city?.city}
                onClick={() => handleCityClick(city)}
                className="py-1 cursor-pointer"
              >
                <span className={`${city.city ? "italic" : "font-bold"}`}>
                  {city.region}
                </span>
                <span
                  className={`text-gray-600 mx-2 ${!city.city && "hidden"}`}
                >
                  |
                </span>
                <span className="font-bold">{city.city && `${city.city}`}</span>
              </li>
            ))}
          </ul>

          )}
        </div>
      )}
    </div>
  );
}

export default CityAutocomplete;

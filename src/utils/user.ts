import axios from "axios";

export async function checkUsernameAvailability(
    usernames: string[]
  ): Promise<string[]> {
    return await axios
      .post("/api/checkUsernames/", usernames)
      .then((response) => {
        const validUsernames = response.data;
        return validUsernames;
      });
  }
  
 export async function getUsernameSuggestions(username: string): Promise<string[]> {
    function getSuggestion(prefix: string, numSuggestions: number) {
      const suggestions = [];
      for (let i = 0; i < numSuggestions; i++) {
        const maxDigits = 12 - prefix.length;
        const digits = Math.min(maxDigits, 5);
        const randomNum = Math.floor(Math.random() * Math.pow(10, digits));
        suggestions.push(`${prefix}${randomNum}`);
      }
      return suggestions;
    }
  
    let email = username;
    let prefix = email.split("@")[0];
  
    if (!isNaN(parseInt(prefix[0]))) {
      prefix = prefix.substring(1);
    }
  
    prefix = prefix.slice(0, 7);
  
    const checkNames = getSuggestion(prefix, 3);
    return checkUsernameAvailability(checkNames);
  }
import { User } from "@/types";
const reducer = (state: any, action: any) => {
    switch (action.type) {
      case "init":
        return {
          ...state,
          friends: action.payload,
        };
      case "add":
        return {
          ...state,
          friends: [...state.friends, action.payload],
        };
      case "remove":
        return {
          ...state,
          friends: state.friends.filter(
            (friend: User) => friend.id !== action.payload.id
          ),
        };
      case "accept":
        console.log("payload", action.payload)
        const payload = action.payload?.id ? action.payload.id : action.payload
        return {
          ...state,
          friends: state.friends.map((friend: User) =>
            friend.id === payload ? { ...friend, accepted: true } : friend
          ),
        };
      default:
        return state;
    }
  }

  export default reducer;
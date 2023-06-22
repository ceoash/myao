import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp} from "firebase/firestore";

function ChatMessage({
    text,
}: any) {

return <p>{text}</p>
}
export default ChatMessage
"use client";

import { useAuth } from "@/lib/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Chat {
  sender: {
    id: string;
    email: string;
  };
}

const Contacts = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchChats = async () => {
      const response = await fetch(
        `http://localhost:3000/api/get-all-senders`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();

      setChats(data.senders);
    };
    fetchChats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-left max-w-md  border-r-2 overflow-y-scroll">
      {chats.map((chat) => (
        <div
          key={chat.sender.id}
          className="border-b-2 p-4  cursor-pointer"
          onClick={() => router.push(`/chat/${chat.sender.id}`)}
        >
          {chat.sender.email}
        </div>
      ))}
    </div>
  );
};

export default Contacts;

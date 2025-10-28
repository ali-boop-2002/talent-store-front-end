// components/MessageThread.tsx
"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  senderId: string;
  message: string;
  createdAt: string;
  senderName: string;
  receiverName: string;
  sender: {
    name: string;
  };
}

export default function MessageThread() {
  const { id } = useParams();
  const senderId = id as string;
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch existing messages
  useEffect(() => {
    const fetchMessages = async () => {
      const response = await fetch(
        `http://localhost:3000/api/get-all-messages-in-conversation/${senderId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();

      setMessages(data.messages || []);
    };

    fetchMessages();
  }, [senderId]);

  useEffect(() => {
    // Create a unique channel name based on BOTH users
    // Sort IDs so channel name is always the same regardless of who opens it
    const channelName = [user?.id, senderId].sort().join("-");
    const channel = supabase
      .channel(`conversation:${channelName}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          // Filter for messages where EITHER user is sender/receiver
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, senderId]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await fetch(`http://localhost:3000/api/send-message/${senderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: newMessage,
        }),
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full min-h-screen overflow-y-hidden relative">
      {/* Messages List */}

      <div className="flex-1 p-4 space-y-4 overflow-y-scroll">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.senderId === user?.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              <p className="text-xs font-semibold mb-1">
                {msg.senderName || "Unknown"}
              </p>
              <p>{msg.message}</p>
              <p className="text-xs  mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {/* Invisible element at the bottom to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="p-4 border-t flex gap-2" onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage(e);
            }
          }}
        />
        <button
          type="submit"
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

import React, { useState, useRef, useEffect, RefObject } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import { AIChefMessage } from "../ai-chef-message/ai-chef-message";
import { LoadingSpinner } from "../../../ui/loading-spinner/loading-spinner";
import { Button, Textarea } from "@khamudom/lumen-ui-react";
import { sendMessageToAIStream } from "../utils/openai";
import styles from "./ai-chef-chat-window.module.css";

type Message = {
  sender: "user" | "ai";
  text: string;
};

interface Props {
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
}

export function AIChefChatWindow({ onClose, buttonRef }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expand textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";
      // Calculate the new height based on scrollHeight
      const newHeight = Math.min(textarea.scrollHeight, 200); // Max 200px
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, buttonRef]);

  // Auto-scroll to bottom when messages change or loading starts, but not during streaming
  useEffect(() => {
    // Only auto-scroll for new messages or when loading starts, not during streaming
    if (!streamingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, streamingMessage]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingMessage("");

    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      // Pass the current conversation history (excluding the user message we just added)
      const conversationHistory = messages;
      const stream = await sendMessageToAIStream(input, conversationHistory);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let fullResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setStreamingMessage(fullResponse);
      }

      // Add the complete streaming message to the messages array
      setMessages((prev) => [
        ...prev,
        { sender: "ai" as const, text: fullResponse },
      ]);
      setStreamingMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <div
      className={`${styles.chatWindow} ${isMaximized ? styles.maximized : ""}`}
      ref={chatWindowRef}
    >
      <div className={styles.header}>
        <h3>Chef Gusto&apos;s Kitchen Chat</h3>
        <div className={styles.headerActions}>
          <button onClick={toggleMaximize} className={styles.maximizeButton}>
            {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={18} />
          </button>
        </div>
      </div>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <AIChefMessage key={index} sender={msg.sender} text={msg.text} />
        ))}
        {streamingMessage && (
          <AIChefMessage sender="ai" text={streamingMessage} isTyping={true} />
        )}
        {loading && !streamingMessage && (
          <div className={styles.loadingContainer}>
            <LoadingSpinner
              size="medium"
              text="Chef is thinking..."
              centered={false}
              animationPath="/assets/lottie/chat-bubble/Animation - 1751394047556.json"
            />
          </div>
        )}
        {loading && streamingMessage && (
          <div className={styles.typingIndicator}>
            <span className={styles.typingText}>Chef is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputArea}>
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="How can I help?"
          className={styles.input}
          rows={1}
          aria-label="Message Chef Gusto"
        />
        <Button
          onClick={handleSend}
          disabled={loading}
          loading={loading}
          className={styles.sendButton}
        >
          Send
        </Button>
      </div>
    </div>
  );
}

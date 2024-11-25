"use client";

import React from 'react';
import { useEffect, useState } from "react";
import * as webllm from "@mlc-ai/web-llm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from "@/components/ui/Select";


type Message = {
  content: string;
  role: "system" | "user" | "assistant";
};

const XeonAIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { content: "You are a helpful AI agent helping users.", role: "system" },
  ]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>(
    "Llama-3.2-3B-Instruct-q4f32_1-MLC"
  );
  const [engine, setEngine] = useState<webllm.MLCEngine | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [userInput, setUserInput] = useState<string>("");

  useEffect(() => {
    const fetchModels = async () => {
      const models = webllm.prebuiltAppConfig.model_list.map((m) => m.model_id);
      setAvailableModels(models);
      setSelectedModel(models[0]);
    };

    const initializeEngine = async () => {
      const engineInstance = new webllm.MLCEngine();
      engineInstance.setInitProgressCallback(({ progress, text }: { progress: number; text: string }) => {
        setDownloadStatus(`${text} (${Math.round(progress * 100)}%)`);
      });
      setEngine(engineInstance);
    };

    fetchModels();
    initializeEngine();
  }, []);

  const initializeWebLLMEngine = async () => {
    if (!engine) return;
    setLoading(true);
    try {
      const config = { temperature: 1.0, top_p: 1 };
      await engine.reload(selectedModel, config);
      setLoading(false);
    } catch (error) {
      console.error("Error initializing WebLLM engine:", error);
      setLoading(false);
    }
  };

  const onMessageSend = async () => {
    if (!userInput.trim() || !engine) return;

    const userMessage: Message = { content: userInput, role: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");

    const aiMessage: Message = { content: "Typing...", role: "assistant" };
    setMessages((prev) => [...prev, aiMessage]);

    try {
      const curMessage = await generateStreamingMessage(userMessage, engine);
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, content: curMessage } : msg
        )
      );
    } catch (error) {
      console.error("Error generating message:", error);
    }
  };

  const generateStreamingMessage = async (message: Message, engine: webllm.MLCEngine): Promise<string> => {
    let curMessage = "";
    const newMessages = [...messages, message];
    try {
      const completion = await engine.chat.completions.create({
        stream: true,
        messages: newMessages,
      });

      for await (const chunk of completion) {
        const curDelta = chunk.choices[0].delta.content || "";
        curMessage += curDelta;

        setMessages((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, content: curMessage } : msg
          )
        );
      }
    } catch (err) {
      console.error("Error during streaming:", err);
      throw err;
    }

    return curMessage;
  };

  return (
    <section className="w-full py-20" id="demo">
      <h2 className="heading">
      <span className="text-purple"> Xeon AI</span> Demo
      </h2>
      <Card className="bg-gray-900 text-white my-20">
        <CardHeader>
          <CardTitle className="text-xl">Xeon AI Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Step 1: Initialize Xeon AI LLM and Download Model</p>
          <p className="text-sm text-orange-500 mb-4">
            Note: The model file can be large and may take some time to download on the first run. Please ensure you have a stable internet connection.
          </p>
          <div className="flex items-center space-x-4 mb-4">
            <Select
              onValueChange={(value) => setSelectedModel(value)}
              value={selectedModel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={initializeWebLLMEngine}
              disabled={loading}
              className="bg-[#cbacf9] hover:bg-blue-600"
            >
              {loading ? "Loading..." : "Download"}
            </Button>
            
          </div>
          {downloadStatus && <p className="text-sm mb-4">{downloadStatus}</p>}

          <p className="mb-4">Step 2: Chat</p>
          <ScrollArea className="h-64 border border-gray-800 p-4 rounded mb-4">
            <div id="chat-box">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`p-2 mb-2 rounded ${
                    message.role === "user" ? "bg-blue-600" : "bg-gray-700"
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex items-center space-x-4">
            <Input
              placeholder="Type a message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />
            <Button
              onClick={onMessageSend}
              disabled={!userInput.trim()}
              className="bg-green-500 hover:bg-green-600"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default XeonAIChat;
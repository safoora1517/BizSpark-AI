'use client';

import * as React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { getAIResponse } from '@/app/actions';
import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Bookmark,
  Bot,
  CircleUser,
  Lightbulb,
  LoaderCircle,
  Menu,
  Rocket,
  Send,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { Logo } from './logo';

const topics = [
  {
    name: 'Market Analysis',
    icon: TrendingUp,
    prompt:
      'Provide a market analysis for a new coffee shop in a bustling downtown area.',
  },
  {
    name: 'Financial Projections',
    icon: Target,
    prompt:
      'Generate 3-year financial projections for a SaaS startup with a $10/month subscription model.',
  },
  {
    name: 'Brand Strategy',
    icon: Lightbulb,
    prompt:
      'Develop a brand strategy for a new line of eco-friendly cleaning products.',
  },
  {
    name: 'Startup Pitch',
    icon: Rocket,
    prompt: 'Create a concise startup pitch for an AI-powered language learning app.',
  },
];

const initialMessages: Message[] = [
  {
    id: 'init',
    role: 'assistant',
    content:
      'Hello! I am BizSpark AI. Ask me a business question, or select a topic to get started.',
  },
];

export default function ChatPage() {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [savedMessages, setSavedMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSidebarOpen, setSidebarOpen] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (prompt: string) => {
    if (isLoading || !prompt.trim()) return;

    setIsLoading(true);
    const userMessage: Message = { id: nanoid(), role: 'user', content: prompt };
    setMessages((prev) => [...prev, userMessage]);

    const assistantId = nanoid();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: 'Thinking...',
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const aiResponse = await getAIResponse(prompt);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: aiResponse } : msg
        )
      );
    } catch (error) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: 'Sorry, I had trouble getting a response.' }
            : msg
        )
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the AI.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicClick = (prompt: string) => {
    if (inputRef.current) {
      inputRef.current.value = prompt;
      inputRef.current.focus();
    }
    setSidebarOpen(false);
    handleSendMessage(prompt);
  };
  
  const handleSaveMessage = (message: Message) => {
    if (savedMessages.find((m) => m.id === message.id)) {
      setSavedMessages(savedMessages.filter((m) => m.id !== message.id));
       toast({
        description: "Answer unsaved.",
      });
    } else {
      setSavedMessages([...savedMessages, message]);
      toast({
        description: "Answer saved to your Bookmarks.",
      });
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card p-4">
      <div className="mb-6">
        <Logo />
      </div>
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold tracking-tight flex items-center gap-2">
          <Sparkles className="text-primary" />
          Topic Browser
        </h3>
        <div className="space-y-2">
          {topics.map((topic) => (
            <Button
              key={topic.name}
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => handleTopicClick(topic.prompt)}
            >
              <topic.icon className="size-4 text-accent" />
              {topic.name}
            </Button>
          ))}
        </div>
      </div>
      <Separator className="my-4" />
      <div className="flex-1 min-h-0">
        <h3 className="mb-3 text-lg font-semibold tracking-tight flex items-center gap-2">
          <Bookmark className="text-primary" />
          Bookmarks
        </h3>
        <ScrollArea className="h-full pr-3 -mr-3">
          {savedMessages.length > 0 ? (
            <Accordion type="single" collapsible>
              {savedMessages.map((msg, index) => (
                <AccordionItem value={`item-${index}`} key={msg.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {msg.content.substring(0, 40)}...
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground whitespace-pre-wrap">
                    {msg.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <p className="text-sm text-muted-foreground">No saved answers yet.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full">
      <aside className="hidden md:block w-80 border-r">
        <SidebarContent />
      </aside>
      <div className="flex flex-col flex-1">
        <header className="flex items-center justify-between p-4 border-b md:hidden">
            <Logo />
            <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 pt-4">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea className="flex-1 p-6" ref={chatContainerRef}>
            <div className="space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="size-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="text-primary-foreground size-5" />
                    </div>
                  )}
                  <Card
                    className={cn(
                      'max-w-xl relative',
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                    )}
                  >
                    <CardContent className="p-3 whitespace-pre-wrap text-sm">
                      {message.content === 'Thinking...' ? (
                        <div className="flex items-center gap-2 font-medium">
                          <LoaderCircle className="animate-spin size-4" />
                          Thinking...
                        </div>
                      ) : (
                        message.content
                      )}
                    </CardContent>
                    {message.role === 'assistant' && message.content !== 'Thinking...' && message.id !== 'init' && (
                       <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -top-3 -right-3 h-7 w-7"
                        onClick={() => handleSaveMessage(message)}
                      >
                        <Bookmark
                          className={cn(
                            'size-4 text-muted-foreground transition-colors hover:text-primary',
                            savedMessages.some(m => m.id === message.id) && 'fill-primary text-primary'
                          )}
                        />
                      </Button>
                    )}
                  </Card>
                   {message.role === 'user' && (
                    <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <CircleUser className="text-muted-foreground size-5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t bg-background">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputRef.current?.value ?? '');
                if (inputRef.current) inputRef.current.value = '';
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                placeholder="Ask a business question..."
                disabled={isLoading}
                className="text-base"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                {isLoading ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Send />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

// Separator is not exported from shadcn by default in this project
function Separator({ className }: { className?: string }) {
  return <div className={cn('shrink-0 bg-border h-[1px] w-full', className)} />;
}

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Message, User } from "@shared/schema";
import { formatDateFromNow } from "@/lib/helpers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { 
  SendIcon, 
  User2Icon, 
  SearchIcon, 
  MessageSquareIcon, 
  InfoIcon
} from "lucide-react";

const MessagesPage = () => {
  const { userId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChat, setActiveChat] = useState<number | null>(userId ? parseInt(userId) : null);

  // Fetch all users
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAuthenticated,
  });

  // Fetch messages with active user
  const { data: messages, isLoading: isLoadingMessages } = useQuery<Message[]>({
    queryKey: [`/api/messages/${activeChat}`],
    enabled: !!activeChat && isAuthenticated,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Fetch unread messages
  const { data: unreadMessages } = useQuery<Message[]>({
    queryKey: ["/api/messages/unread"],
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { receiverId: number; message: string }) => {
      const response = await apiRequest("POST", "/api/messages", data);
      return response.json();
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${activeChat}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send message",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Mark message as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      const response = await apiRequest("PUT", `/api/messages/${messageId}/read`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread"] });
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (activeChat && unreadMessages) {
      unreadMessages
        .filter(msg => msg.senderId === activeChat)
        .forEach(msg => {
          markAsReadMutation.mutate(msg.id);
        });
    }
  }, [activeChat, unreadMessages]);

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !activeChat) return;
    
    sendMessageMutation.mutate({
      receiverId: activeChat,
      message: message.trim(),
    });
  };

  // Filter users for chat list
  const filteredUsers = users?.filter(u => 
    u.id !== user?.id && 
    (u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get unread message count for a user
  const getUnreadCount = (userId: number) => {
    if (!unreadMessages) return 0;
    return unreadMessages.filter(msg => msg.senderId === userId).length;
  };

  // Check if user has any unread messages
  const hasUnreadMessages = !!unreadMessages && unreadMessages.length > 0;

  // Get active chat user
  const activeChatUser = users?.find(u => u.id === activeChat);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <MessageSquareIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold">Sign in to access messages</h2>
                <p className="mt-2 text-gray-500">Please sign in to view and send messages</p>
                <Button className="mt-4" asChild>
                  <a href="/signin">Sign In</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
            <p className="mt-2 text-gray-600">
              Communicate with clients and students about gigs and projects
            </p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3 h-[600px]">
              {/* Users list */}
              <div className="border-r border-gray-200">
                <div className="p-4 border-b">
                  <div className="relative">
                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts"
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-[536px]">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    <div className="divide-y">
                      {filteredUsers.map((contact) => {
                        const unreadCount = getUnreadCount(contact.id);
                        const isActive = activeChat === contact.id;
                        
                        return (
                          <div
                            key={contact.id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer ${
                              isActive ? "bg-gray-50" : ""
                            }`}
                            onClick={() => setActiveChat(contact.id)}
                          >
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={contact.profilePicture} alt={contact.fullName} />
                                <AvatarFallback>
                                  {contact.fullName?.charAt(0) || contact.username.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3 flex-1">
                                <div className="font-medium">
                                  {contact.fullName || contact.username}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {contact.university || contact.role}
                                </div>
                              </div>
                              {unreadCount > 0 && (
                                <div className="bg-primary text-white text-xs font-medium rounded-full h-5 min-w-[20px] flex items-center justify-center px-1">
                                  {unreadCount}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No contacts found
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Chat area */}
              <div className="col-span-2 flex flex-col">
                {activeChat ? (
                  <>
                    {/* Chat header */}
                    <div className="p-4 border-b flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={activeChatUser?.profilePicture} alt={activeChatUser?.fullName} />
                        <AvatarFallback>
                          {activeChatUser?.fullName?.charAt(0) || 
                           activeChatUser?.username?.charAt(0) || 
                           <User2Icon className="h-5 w-5" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <div className="font-medium">
                          {activeChatUser?.fullName || activeChatUser?.username || "Loading..."}
                        </div>
                        <div className="text-sm text-gray-500">
                          {activeChatUser?.university || activeChatUser?.role || ""}
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4">
                      {isLoadingMessages ? (
                        <div className="flex justify-center items-center h-full">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : messages && messages.length > 0 ? (
                        <div className="space-y-4">
                          {messages.map((msg) => {
                            const isCurrentUser = msg.senderId === user?.id;
                            
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                    isCurrentUser
                                      ? "bg-primary text-white"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  <div>{msg.message}</div>
                                  <div
                                    className={`text-xs mt-1 ${
                                      isCurrentUser ? "text-primary-100" : "text-gray-500"
                                    }`}
                                  >
                                    {formatDateFromNow(msg.createdAt)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <MessageSquareIcon className="h-12 w-12 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900">No messages yet</h3>
                          <p className="mt-2 text-gray-500 max-w-sm">
                            Start a conversation with {activeChatUser?.fullName || "this user"} about a gig or project.
                          </p>
                        </div>
                      )}
                    </ScrollArea>

                    {/* Message input */}
                    <div className="p-4 border-t">
                      <form onSubmit={handleSendMessage} className="flex items-center">
                        <Input
                          placeholder="Type a message..."
                          className="flex-1"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                        />
                        <Button 
                          type="submit" 
                          size="icon" 
                          className="ml-2"
                          disabled={!message.trim() || sendMessageMutation.isPending}
                        >
                          <SendIcon className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <MessageSquareIcon className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">Your Messages</h3>
                    <p className="mt-2 text-gray-500 max-w-md">
                      {hasUnreadMessages
                        ? "You have unread messages. Select a conversation to view."
                        : "Select a conversation or start a new one by clicking on a contact."}
                    </p>
                    {!filteredUsers?.length && (
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg flex items-start max-w-md">
                        <InfoIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="text-sm text-blue-700 text-left">
                          <p>No conversations yet? Browse gigs and contact clients, or wait for students to contact you about your posted gigs.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MessagesPage;

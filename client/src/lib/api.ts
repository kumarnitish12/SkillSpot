import { apiRequest } from "@/lib/queryClient";

// Get authentication token from local storage
const getToken = () => localStorage.getItem("skillhub_token");

// API request helpers with authentication
export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const token = getToken();
    const response = await fetch(endpoint, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: "include",
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || response.statusText);
    }
    
    return response.json();
  },
  
  post: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await apiRequest("POST", endpoint, data);
    return response.json();
  },
  
  put: async <T>(endpoint: string, data: any): Promise<T> => {
    const response = await apiRequest("PUT", endpoint, data);
    return response.json();
  },
  
  delete: async <T>(endpoint: string): Promise<T> => {
    const response = await apiRequest("DELETE", endpoint);
    return response.json();
  }
};

// Specialized API functions for different resources
export const userApi = {
  getCurrentUser: () => api.get("/api/auth/me"),
  updateProfile: (userId: number, data: any) => api.put(`/api/users/${userId}`, data),
  getSkills: (userId: number) => api.get(`/api/users/${userId}/skills`),
  addSkill: (skillData: any) => api.post("/api/skills", skillData),
  updateSkill: (skillId: number, data: any) => api.put(`/api/skills/${skillId}`, data),
  deleteSkill: (skillId: number) => api.delete(`/api/skills/${skillId}`),
  getReviews: (userId: number) => api.get(`/api/users/${userId}/reviews`)
};

export const gigApi = {
  getAll: () => api.get("/api/gigs"),
  getByCategory: (category: string) => api.get(`/api/gigs/category/${category}`),
  getById: (gigId: number) => api.get(`/api/gigs/${gigId}`),
  getUserGigs: (userId: number) => api.get(`/api/users/${userId}/gigs`),
  create: (gigData: any) => api.post("/api/gigs", gigData),
  update: (gigId: number, data: any) => api.put(`/api/gigs/${gigId}`, data),
  delete: (gigId: number) => api.delete(`/api/gigs/${gigId}`),
  getBids: (gigId: number) => api.get(`/api/gigs/${gigId}/bids`),
  submitBid: (gigId: number, bidData: any) => api.post(`/api/gigs/${gigId}/bids`, bidData),
  getReviews: (gigId: number) => api.get(`/api/gigs/${gigId}/reviews`),
  addReview: (gigId: number, reviewData: any) => api.post(`/api/gigs/${gigId}/reviews`, reviewData)
};

export const bidApi = {
  getByUser: (userId: number) => api.get(`/api/users/${userId}/bids`),
  updateBid: (bidId: number, data: any) => api.put(`/api/bids/${bidId}`, data)
};

export const messageApi = {
  getWithUser: (userId: number) => api.get(`/api/messages/${userId}`),
  getUnread: () => api.get("/api/messages/unread"),
  send: (messageData: any) => api.post("/api/messages", messageData),
  markAsRead: (messageId: number) => api.put(`/api/messages/${messageId}/read`, {})
};

export const categoryApi = {
  getAll: () => api.get("/api/categories")
};

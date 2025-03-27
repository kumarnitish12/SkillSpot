import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z, ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { 
  insertUserSchema, 
  insertSkillSchema,
  insertGigSchema,
  insertBidSchema,
  insertReviewSchema,
  insertMessageSchema
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "skillhub-secret-key";
const TOKEN_EXPIRY = "7d";

// Authentication middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    (req as any).user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Authentication routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      
      // Create user
      const user = await storage.createUser(userData);
      
      // Generate token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Generate token
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({
        message: "Login successful",
        user: userWithoutPassword,
        token
      });
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/auth/me", authenticate, async (req: Request, res: Response) => {
    // Remove password from response
    const { password, ...userWithoutPassword } = (req as any).user;
    res.json(userWithoutPassword);
  });
  
  // User routes
  app.get("/api/users", async (_req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from users
      const usersWithoutPasswords = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.put("/api/users/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is updating their own profile
      if ((req as any).user.id !== id) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      
      const userData = req.body;
      
      // If updating password, hash it
      if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
      }
      
      const updatedUser = await storage.updateUser(id, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json({
        message: "User updated successfully",
        user: userWithoutPassword
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Skill routes
  app.get("/api/skills", async (_req: Request, res: Response) => {
    try {
      const skills = await storage.getAllSkills();
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/users/:userId/skills", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const skills = await storage.getSkillsByUser(userId);
      res.json(skills);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/skills", authenticate, async (req: Request, res: Response) => {
    try {
      const skillData = insertSkillSchema.parse({
        ...req.body,
        userId: (req as any).user.id
      });
      
      const skill = await storage.createSkill(skillData);
      
      res.status(201).json({
        message: "Skill created successfully",
        skill
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.put("/api/skills/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      const skill = await storage.getSkill(id);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Check if user owns the skill
      if (skill.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to update this skill" });
      }
      
      const skillData = req.body;
      const updatedSkill = await storage.updateSkill(id, skillData);
      
      res.json({
        message: "Skill updated successfully",
        skill: updatedSkill
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.delete("/api/skills/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid skill ID" });
      }
      
      const skill = await storage.getSkill(id);
      
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      // Check if user owns the skill
      if (skill.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to delete this skill" });
      }
      
      await storage.deleteSkill(id);
      
      res.json({
        message: "Skill deleted successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Gig routes
  app.get("/api/gigs", async (_req: Request, res: Response) => {
    try {
      const gigs = await storage.getAllGigs();
      res.json(gigs);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/gigs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const gig = await storage.getGig(id);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      res.json(gig);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/gigs/category/:category", async (req: Request, res: Response) => {
    try {
      const category = req.params.category;
      const gigs = await storage.getGigsByCategory(category);
      res.json(gigs);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/users/:userId/gigs", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const gigs = await storage.getGigsByUser(userId);
      res.json(gigs);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/gigs", authenticate, async (req: Request, res: Response) => {
    try {
      const gigData = insertGigSchema.parse({
        ...req.body,
        userId: (req as any).user.id
      });
      
      const gig = await storage.createGig(gigData);
      
      res.status(201).json({
        message: "Gig created successfully",
        gig
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.put("/api/gigs/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const gig = await storage.getGig(id);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      // Check if user owns the gig
      if (gig.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to update this gig" });
      }
      
      const gigData = req.body;
      const updatedGig = await storage.updateGig(id, gigData);
      
      res.json({
        message: "Gig updated successfully",
        gig: updatedGig
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.delete("/api/gigs/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const gig = await storage.getGig(id);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      // Check if user owns the gig
      if (gig.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to delete this gig" });
      }
      
      await storage.deleteGig(id);
      
      res.json({
        message: "Gig deleted successfully"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Bid routes
  app.get("/api/gigs/:gigId/bids", async (req: Request, res: Response) => {
    try {
      const gigId = parseInt(req.params.gigId);
      
      if (isNaN(gigId)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const bids = await storage.getBidsByGig(gigId);
      res.json(bids);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/users/:userId/bids", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      // Check if user is viewing their own bids
      if ((req as any).user.id !== userId) {
        return res.status(403).json({ message: "Not authorized to view these bids" });
      }
      
      const bids = await storage.getBidsByUser(userId);
      res.json(bids);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/gigs/:gigId/bids", authenticate, async (req: Request, res: Response) => {
    try {
      const gigId = parseInt(req.params.gigId);
      
      if (isNaN(gigId)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const gig = await storage.getGig(gigId);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      // Check if user is not bidding on their own gig
      if (gig.userId === (req as any).user.id) {
        return res.status(400).json({ message: "Cannot bid on your own gig" });
      }
      
      const bidData = insertBidSchema.parse({
        ...req.body,
        userId: (req as any).user.id,
        gigId
      });
      
      const bid = await storage.createBid(bidData);
      
      res.status(201).json({
        message: "Bid submitted successfully",
        bid
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.put("/api/bids/:id", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid bid ID" });
      }
      
      const bid = await storage.getBid(id);
      
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      // Get the gig to check ownership
      const gig = await storage.getGig(bid.gigId);
      
      if (!gig) {
        return res.status(404).json({ message: "Associated gig not found" });
      }
      
      // Only the gig owner can update bid status, and bid owner can update other details
      if (req.body.status && gig.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Only gig owner can update bid status" });
      } else if (!req.body.status && bid.userId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to update this bid" });
      }
      
      const bidData = req.body;
      const updatedBid = await storage.updateBid(id, bidData);
      
      res.json({
        message: "Bid updated successfully",
        bid: updatedBid
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Review routes
  app.get("/api/users/:userId/reviews", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const reviews = await storage.getReviewsByReviewee(userId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/gigs/:gigId/reviews", async (req: Request, res: Response) => {
    try {
      const gigId = parseInt(req.params.gigId);
      
      if (isNaN(gigId)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const reviews = await storage.getReviewsByGig(gigId);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/gigs/:gigId/reviews", authenticate, async (req: Request, res: Response) => {
    try {
      const gigId = parseInt(req.params.gigId);
      
      if (isNaN(gigId)) {
        return res.status(400).json({ message: "Invalid gig ID" });
      }
      
      const gig = await storage.getGig(gigId);
      
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        gigId,
        reviewerId: (req as any).user.id,
        revieweeId: req.body.revieweeId
      });
      
      const review = await storage.createReview(reviewData);
      
      res.status(201).json({
        message: "Review submitted successfully",
        review
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Message routes
  app.get("/api/messages/unread", authenticate, async (req: Request, res: Response) => {
    try {
      const unreadMessages = await storage.getUnreadMessagesByUser((req as any).user.id);
      res.json(unreadMessages);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.get("/api/messages/:userId", authenticate, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      
      const messages = await storage.getMessagesBetweenUsers((req as any).user.id, userId);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.post("/api/messages", authenticate, async (req: Request, res: Response) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId: (req as any).user.id
      });
      
      // Check if receiver exists
      const receiver = await storage.getUser(messageData.receiverId);
      
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const message = await storage.createMessage(messageData);
      
      res.status(201).json({
        message: "Message sent successfully",
        data: message
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error });
      }
      
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  app.put("/api/messages/:id/read", authenticate, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      
      const message = await storage.getMessage(id);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      // Check if user is the receiver
      if (message.receiverId !== (req as any).user.id) {
        return res.status(403).json({ message: "Not authorized to mark this message as read" });
      }
      
      await storage.markMessageAsRead(id);
      
      res.json({
        message: "Message marked as read"
      });
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (_req: Request, res: Response) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  
  return httpServer;
}

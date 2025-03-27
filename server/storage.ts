import { 
  users, type User, type InsertUser,
  skills, type Skill, type InsertSkill,
  gigs, type Gig, type InsertGig,
  bids, type Bid, type InsertBid,
  reviews, type Review, type InsertReview,
  messages, type Message, type InsertMessage,
  categories, type Category, type InsertCategory
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Skill operations
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUser(userId: number): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  getAllSkills(): Promise<Skill[]>;
  
  // Gig operations
  getGig(id: number): Promise<Gig | undefined>;
  getGigsByUser(userId: number): Promise<Gig[]>;
  createGig(gig: InsertGig): Promise<Gig>;
  updateGig(id: number, gig: Partial<Gig>): Promise<Gig | undefined>;
  deleteGig(id: number): Promise<boolean>;
  getAllGigs(): Promise<Gig[]>;
  getGigsByCategory(category: string): Promise<Gig[]>;
  
  // Bid operations
  getBid(id: number): Promise<Bid | undefined>;
  getBidsByGig(gigId: number): Promise<Bid[]>;
  getBidsByUser(userId: number): Promise<Bid[]>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: number, bid: Partial<Bid>): Promise<Bid | undefined>;
  deleteBid(id: number): Promise<boolean>;
  
  // Review operations
  getReview(id: number): Promise<Review | undefined>;
  getReviewsByReviewer(reviewerId: number): Promise<Review[]>;
  getReviewsByReviewee(revieweeId: number): Promise<Review[]>;
  getReviewsByGig(gigId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  deleteReview(id: number): Promise<boolean>;
  
  // Message operations
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]>;
  getUnreadMessagesByUser(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryByName(name: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private gigs: Map<number, Gig>;
  private bids: Map<number, Bid>;
  private reviews: Map<number, Review>;
  private messages: Map<number, Message>;
  private categories: Map<number, Category>;
  
  private userIdCounter: number;
  private skillIdCounter: number;
  private gigIdCounter: number;
  private bidIdCounter: number;
  private reviewIdCounter: number;
  private messageIdCounter: number;
  private categoryIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.gigs = new Map();
    this.bids = new Map();
    this.reviews = new Map();
    this.messages = new Map();
    this.categories = new Map();
    
    this.userIdCounter = 1;
    this.skillIdCounter = 1;
    this.gigIdCounter = 1;
    this.bidIdCounter = 1;
    this.reviewIdCounter =
     1;
    this.messageIdCounter = 1;
    this.categoryIdCounter = 1;
    
    // Initialize default categories
    this.initializeCategories();
  }
  
  private initializeCategories() {
    const defaultCategories = [
      { name: "Web Development", icon: "code-s-slash-line", description: "Website creation, frontend, backend, and full-stack development services." },
      { name: "Graphic Design", icon: "paint-brush-line", description: "Logos, illustrations, UI/UX design, and other creative visual services." },
      { name: "Content Writing", icon: "article-line", description: "Blog posts, articles, copywriting, and academic writing services." },
      { name: "Digital Marketing", icon: "line-chart-line", description: "Social media management, SEO, content strategy, and growth hacking." },
      { name: "Mobile Development", icon: "smartphone-line", description: "iOS, Android, and cross-platform mobile app development." },
      { name: "Video & Animation", icon: "movie-line", description: "Video editing, animation, motion graphics, and visual effects." },
      { name: "Data Analysis", icon: "bar-chart-line", description: "Data processing, visualization, and insights generation." },
      { name: "Photography", icon: "camera-line", description: "Event, product, portrait, and commercial photography." }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id,
      isVerified: false,
      bio: insertUser.bio || null,
      university: insertUser.university || null,
      major: insertUser.major || null,
      profilePicture: insertUser.profilePicture || null,
      role: insertUser.role || "student"
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  // Skill operations
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }
  
  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.userId === userId);
  }
  
  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const id = this.skillIdCounter++;
    const skill: Skill = { 
      ...insertSkill, 
      id,
      description: insertSkill.description || null,
      yearsExperience: insertSkill.yearsExperience || null
    };
    this.skills.set(id, skill);
    return skill;
  }
  
  async updateSkill(id: number, skillData: Partial<Skill>): Promise<Skill | undefined> {
    const skill = await this.getSkill(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...skillData };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }
  
  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }
  
  async getAllSkills(): Promise<Skill[]> {
    return Array.from(this.skills.values());
  }
  
  // Gig operations
  async getGig(id: number): Promise<Gig | undefined> {
    return this.gigs.get(id);
  }
  
  async getGigsByUser(userId: number): Promise<Gig[]> {
    return Array.from(this.gigs.values()).filter(gig => gig.userId === userId);
  }
  
  async createGig(insertGig: InsertGig): Promise<Gig> {
    const id = this.gigIdCounter++;
    const createdAt = new Date().toISOString();
    const gig: Gig = { 
      ...insertGig, 
      id, 
      createdAt,
      status: insertGig.status || "open",
      imageUrl: insertGig.imageUrl || null
    };
    this.gigs.set(id, gig);
    return gig;
  }
  
  async updateGig(id: number, gigData: Partial<Gig>): Promise<Gig | undefined> {
    const gig = await this.getGig(id);
    if (!gig) return undefined;
    
    const updatedGig = { ...gig, ...gigData };
    this.gigs.set(id, updatedGig);
    return updatedGig;
  }
  
  async deleteGig(id: number): Promise<boolean> {
    return this.gigs.delete(id);
  }
  
  async getAllGigs(): Promise<Gig[]> {
    return Array.from(this.gigs.values());
  }
  
  async getGigsByCategory(category: string): Promise<Gig[]> {
    return Array.from(this.gigs.values()).filter(
      gig => gig.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Bid operations
  async getBid(id: number): Promise<Bid | undefined> {
    return this.bids.get(id);
  }
  
  async getBidsByGig(gigId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(bid => bid.gigId === gigId);
  }
  
  async getBidsByUser(userId: number): Promise<Bid[]> {
    return Array.from(this.bids.values()).filter(bid => bid.userId === userId);
  }
  
  async createBid(insertBid: InsertBid): Promise<Bid> {
    const id = this.bidIdCounter++;
    const createdAt = new Date().toISOString();
    const bid: Bid = { 
      ...insertBid, 
      id, 
      createdAt,
      status: insertBid.status || "pending"
    };
    this.bids.set(id, bid);
    return bid;
  }
  
  async updateBid(id: number, bidData: Partial<Bid>): Promise<Bid | undefined> {
    const bid = await this.getBid(id);
    if (!bid) return undefined;
    
    const updatedBid = { ...bid, ...bidData };
    this.bids.set(id, updatedBid);
    return updatedBid;
  }
  
  async deleteBid(id: number): Promise<boolean> {
    return this.bids.delete(id);
  }
  
  // Review operations
  async getReview(id: number): Promise<Review | undefined> {
    return this.reviews.get(id);
  }
  
  async getReviewsByReviewer(reviewerId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.reviewerId === reviewerId);
  }
  
  async getReviewsByReviewee(revieweeId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.revieweeId === revieweeId);
  }
  
  async getReviewsByGig(gigId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.gigId === gigId);
  }
  
  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const createdAt = new Date().toISOString();
    const review: Review = { 
      ...insertReview, 
      id, 
      createdAt,
      comment: insertReview.comment || null
    };
    this.reviews.set(id, review);
    return review;
  }
  
  async deleteReview(id: number): Promise<boolean> {
    return this.reviews.delete(id);
  }
  
  // Message operations
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }
  
  async getMessagesBetweenUsers(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => 
        (message.senderId === user1Id && message.receiverId === user2Id) ||
        (message.senderId === user2Id && message.receiverId === user1Id)
    ).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }
  
  async getUnreadMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      message => message.receiverId === userId && !message.isRead
    );
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const createdAt = new Date().toISOString();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt,
      isRead: insertMessage.isRead || false
    };
    this.messages.set(id, message);
    return message;
  }
  
  async markMessageAsRead(id: number): Promise<boolean> {
    const message = await this.getMessage(id);
    if (!message) return false;
    
    const updatedMessage = { ...message, isRead: true };
    this.messages.set(id, updatedMessage);
    return true;
  }
  
  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async getCategoryByName(name: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(
      category => category.name.toLowerCase() === name.toLowerCase()
    );
  }
  
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryIdCounter++;
    const category: Category = { 
      ...insertCategory, 
      id, 
      description: insertCategory.description || null 
    };
    this.categories.set(id, category);
    return category;
  }
}

export const storage = new MemStorage();

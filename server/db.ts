import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  CollegeEvent,
  Registration,
  FeedbackSubmission,
  InstitutionalReport,
  SystemNotification
} from '../src/types';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  events: CollegeEvent[];
  registrations: Registration[];
  feedbacks: FeedbackSubmission[];
  reports: InstitutionalReport[];
  notifications: SystemNotification[];
}

export class MongoCollection<T extends { _id: string }> {
  private getList: () => T[];
  private setList: (list: T[]) => void;
  private save: () => void;

  constructor(
    getList: () => T[],
    setList: (list: T[]) => void,
    save: () => void
  ) {
    this.getList = getList;
    this.setList = setList;
    this.save = save;
  }

  async find(filter: Partial<Record<keyof T, any>> = {}): Promise<T[]> {
    const list = this.getList();
    return list.filter((item) => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        const val = filter[key];
        if (val !== undefined && item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  async findOne(filter: Partial<Record<keyof T, any>>): Promise<T | null> {
    const results = await this.find(filter);
    return results[0] || null;
  }

  async insertOne(doc: T): Promise<T> {
    const list = this.getList();
    list.push(doc);
    this.setList(list);
    this.save();
    return doc;
  }

  async insertMany(docs: T[]): Promise<T[]> {
    const list = this.getList();
    list.push(...docs);
    this.setList(list);
    this.save();
    return docs;
  }

  async updateOne(
    filter: Partial<Record<keyof T, any>>,
    update: Partial<T>
  ): Promise<T | null> {
    const list = this.getList();
    const index = list.findIndex((item) => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    if (index === -1) return null;
    list[index] = { ...list[index], ...update };
    this.setList(list);
    this.save();
    return list[index];
  }

  async deleteOne(filter: Partial<Record<keyof T, any>>): Promise<boolean> {
    const list = this.getList();
    const index = list.findIndex((item) => {
      for (const key of Object.keys(filter) as (keyof T)[]) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });

    if (index === -1) return false;
    list.splice(index, 1);
    this.setList(list);
    this.save();
    return true;
  }

  async deleteMany(
    filter: Partial<Record<keyof T, any>> | ((item: T) => boolean)
  ): Promise<number> {
    const list = this.getList();
    const initialLength = list.length;
    let updatedList: T[];

    if (typeof filter === 'function') {
      updatedList = list.filter((item) => !filter(item));
    } else {
      updatedList = list.filter((item) => {
        for (const key of Object.keys(filter) as (keyof T)[]) {
          const val = filter[key];
          if (val !== undefined && item[key] === val) {
            return false;
          }
        }
        return true;
      });
    }

    const deletedCount = initialLength - updatedList.length;
    if (deletedCount > 0) {
      this.setList(updatedList);
      this.save();
    }
    return deletedCount;
  }

  async countDocuments(filter: Partial<Record<keyof T, any>> = {}): Promise<number> {
    const items = await this.find(filter);
    return items.length;
  }
}

class Database {
  private data: DatabaseSchema = {
    users: [],
    events: [],
    registrations: [],
    feedbacks: [],
    reports: [],
    notifications: [],
  };

  private passwordMap: Record<string, string> = {}; // email -> bcrypt hash

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || [],
          events: parsed.events || [],
          registrations: parsed.registrations || [],
          feedbacks: parsed.feedbacks || [],
          reports: parsed.reports || [],
          notifications: parsed.notifications || [],
        };
        this.passwordMap = parsed.passwordMap || {};

        // Strip out any dummy/random organizer and student accounts
        this.data.users = this.data.users.filter(
          (u) =>
            u.role === 'admin' ||
            (!u._id.startsWith('usr_org_') && !u._id.startsWith('usr_std_'))
        );

        // Strip out dummy/random events
        this.data.events = this.data.events.filter(
          (e) =>
            !e._id.startsWith('evt_cocurricular_') &&
            !e._id.startsWith('evt_iic_') &&
            !e._id.startsWith('evt_hackathon_') &&
            !e._id.startsWith('evt_placement_') &&
            !e._id.startsWith('evt_pending_approval_sample')
        );

        // Filter out registrations tied to deleted events/users
        const validEventIds = new Set(this.data.events.map((e) => e._id));
        const validUserIds = new Set(this.data.users.map((u) => u._id));
        this.data.registrations = this.data.registrations.filter(
          (r) => validEventIds.has(r.eventId) && validUserIds.has(r.userId)
        );
        this.data.feedbacks = this.data.feedbacks.filter(
          (f) => validEventIds.has(f.eventId) && validUserIds.has(f.userId)
        );
        this.data.reports = this.data.reports.filter((rep) =>
          validEventIds.has(rep.eventId)
        );
        this.data.notifications = this.data.notifications.filter(
          (n) => !n.eventId || validEventIds.has(n.eventId)
        );

        // Clean passwordMap to only keep registered user emails
        const validEmails = new Set(this.data.users.map((u) => u.email.toLowerCase()));
        validEmails.add('admin@apcoer.edu.in');
        for (const email of Object.keys(this.passwordMap)) {
          if (!validEmails.has(email.toLowerCase())) {
            delete this.passwordMap[email];
          }
        }

        // Ensure admin account always has APCOER@2026 configured
        this.passwordMap['admin@apcoer.edu.in'] = bcrypt.hashSync('APCOER@2026', 8);
        const adminUser = this.data.users.find(
          (u) => u.email.toLowerCase() === 'admin@apcoer.edu.in' || u._id === 'usr_admin_1'
        );
        if (!adminUser) {
          this.data.users.unshift({
            _id: 'usr_admin_1',
            name: 'Dr. Sunil Thakare (Principal / Admin)',
            email: 'admin@apcoer.edu.in',
            role: 'admin',
            department: 'Administration',
            designation: 'Principal & Chief Administrator',
            verified: true,
            createdAt: '2025-01-15T08:00:00.000Z',
          });
        } else {
          adminUser.name = 'Dr. Sunil Thakare (Principal / Admin)';
        }

        this.save();
      } else {
        this.seedInitialData();
      }
    } catch (err) {
      console.error('Error initializing database, using default seed:', err);
      this.seedInitialData();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
          {
            ...this.data,
            passwordMap: this.passwordMap,
          },
          null,
          2
        ),
        'utf-8'
      );
    } catch (err) {
      console.error('Failed to persist database to file:', err);
    }
  }

  public getPasswordHash(email: string): string | undefined {
    return this.passwordMap[email.toLowerCase()];
  }

  public setPasswordHash(email: string, hash: string): void {
    this.passwordMap[email.toLowerCase()] = hash;
    this.save();
  }

  private seedInitialData() {
    const adminPasswordHash = bcrypt.hashSync('APCOER@2026', 8);

    // Initial Users: Only the designated principal & administrator
    const users: User[] = [
      {
        _id: 'usr_admin_1',
        name: 'Dr. Sunil Thakare (Principal / Admin)',
        email: 'admin@apcoer.edu.in',
        role: 'admin',
        department: 'Administration',
        designation: 'Principal & Chief Administrator',
        verified: true,
        createdAt: '2025-01-15T08:00:00.000Z',
      },
    ];

    this.passwordMap = {
      'admin@apcoer.edu.in': adminPasswordHash,
    };

    const events: CollegeEvent[] = [];
    const registrations: Registration[] = [];
    const feedbacks: FeedbackSubmission[] = [];
    const reports: InstitutionalReport[] = [];

    const notifications: SystemNotification[] = [
      {
        _id: 'notif_welcome',
        userId: 'ALL',
        title: 'Welcome to CampusConnect APCOER',
        message: 'APCOER centralized college event and activity management system.',
        type: 'event_announced',
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    this.data = {
      users,
      events,
      registrations,
      feedbacks,
      reports,
      notifications,
    };

    this.save();
  }

  // MongoDB Collection Accessors
  public collection(name: 'users'): MongoCollection<User>;
  public collection(name: 'events'): MongoCollection<CollegeEvent>;
  public collection(name: 'registrations'): MongoCollection<Registration>;
  public collection(name: 'feedbacks'): MongoCollection<FeedbackSubmission>;
  public collection(name: 'reports'): MongoCollection<InstitutionalReport>;
  public collection(name: 'notifications'): MongoCollection<SystemNotification>;
  public collection(name: keyof DatabaseSchema): any {
    switch (name) {
      case 'users':
        return new MongoCollection<User>(
          () => this.data.users,
          (list) => {
            this.data.users = list;
          },
          () => this.save()
        );
      case 'events':
        return new MongoCollection<CollegeEvent>(
          () => this.data.events,
          (list) => {
            this.data.events = list;
          },
          () => this.save()
        );
      case 'registrations':
        return new MongoCollection<Registration>(
          () => this.data.registrations,
          (list) => {
            this.data.registrations = list;
          },
          () => this.save()
        );
      case 'feedbacks':
        return new MongoCollection<FeedbackSubmission>(
          () => this.data.feedbacks,
          (list) => {
            this.data.feedbacks = list;
          },
          () => this.save()
        );
      case 'reports':
        return new MongoCollection<InstitutionalReport>(
          () => this.data.reports,
          (list) => {
            this.data.reports = list;
          },
          () => this.save()
        );
      case 'notifications':
        return new MongoCollection<SystemNotification>(
          () => this.data.notifications,
          (list) => {
            this.data.notifications = list;
          },
          () => this.save()
        );
      default:
        throw new Error(`Unknown collection: ${name}`);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();

import { LucideIcon } from 'lucide-react';

export interface Student {
  id: number;
  name: string;
  stars: number;
  spent: number;
  history: number[];
  avatar: string | null;
}

export interface GroupConfig {
  id: number;
  members: string[];
}

export interface Prize {
  name: string;
  type: string;
  prob: number;
  [key: string]: any;
}

export interface PrizeDB {
  [key: string]: Prize[];
}

export interface PoolMetadataItem {
  key: string;
  title: string;
  slogan: string;
  cost: number;
  gradient: string;
  shadow: string;
  iconColor: string;
  color: string;
  icon: LucideIcon;
}

export interface PoolMetadata {
  [key: string]: PoolMetadataItem;
}

export interface ActionReason {
  label: string;
  score: number;
  type: 'success' | 'warning' | 'orange' | 'danger';
}

export interface LogEntry {
  amount: number;
  reason: string;
  id: number;
}

export interface StarLogs {
  [key: string]: LogEntry[];
}

export interface LotteryRecord {
  id: number;
  studentName: string;
  tierTitle: string;
  prize: string;
  timestamp: string;
}

export interface PendingPrize {
  id: number;
  studentName: string;
  studentId: number;
  prizeName: string;
  prizeType: string;
  timestamp: string;
  redeemedAt?: string;
}

export interface GachaponState {
  isOpen: boolean;
  tier: string | null;
  stage: 'auth' | 'denied' | 'idle' | 'spinning' | 'result';
  result: string | null;
  studentId: string;
  studentName: string;
  currentStars: number;
  aiDescription: string | null;
  resultType: string | null;
}

export interface GroupData {
    id: number;
    name: string;
    students: Student[];
    totalStars: number;
    avgStars: number;
    leaderId?: number;
}
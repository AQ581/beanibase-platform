export interface Coach {
  id: string;
  name: string;
  persona: string;
  description: string;
  icon: string;
  color: string;
  accent: string;
  systemInstruction: string;
  famousLine: string;
  motto: string;
  welcomeMessage: string;
  category: 'Language' | 'Logic' | 'Creativity' | 'Leadership' | 'Research' | 'Beanbag';
  quickPrompts: string[];
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  cushionFluffiness: number;
  trialMessagesUsed?: number;
  subscriptionType?: 'free' | 'monthly' | 'lifetime';
  subscriptionExpiry?: string;
  createdAt: string;
}

export interface CheckIn {
  uid: string;
  coachId: string;
  timestamp: string;
  reflection?: string;
}

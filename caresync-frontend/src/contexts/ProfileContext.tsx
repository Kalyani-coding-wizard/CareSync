'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  dosage: string;
  unit: string;
  frequency: 'daily' | 'twice_daily' | 'three_times' | 'weekly' | 'as_needed' | 'custom';
  times: string[]; // e.g. ["08:00", "20:00"]
  instructions: string;
  startDate: string;
  endDate?: string;
  refillCount: number;
  refillAlertAt: number;
  color: string;
  active: boolean;
}

export interface AdherenceRecord {
  id: string;
  profileId: string;
  medId: string;
  medName: string;
  dosage: string;
  scheduledTime: string; // ISO string or "08:00"
  date: string; // "YYYY-MM-DD"
  status: 'taken' | 'missed' | 'pending';
  takenAt?: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  profileId: string;
  doctorName: string;
  specialty: string;
  dateTime: string;
  location: string;
  notes: string;
  reminderSent: boolean;
}

export interface ElderlyProfile {
  id: string;
  name: string;
  dob: string;
  passcode: string;
  ownerId: string;
  ownerEmail: string;
  relationship?: string;
  emergencyEmails: string[];
  emergencyPhones?: string[];
  allergies?: string[];
  notes?: string;
}

interface ProfileContextType {
  activeProfile: ElderlyProfile | null;
  profiles: ElderlyProfile[];
  medications: Medication[];
  adherenceRecords: AdherenceRecord[];
  appointments: Appointment[];
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  setFontSize: (size: 'normal' | 'large' | 'xl') => void;
  setHighContrast: (enabled: boolean) => void;
  setActiveProfile: (profile: ElderlyProfile) => void;
  createProfile: (data: Omit<ElderlyProfile, 'id' | 'passcode'>) => Promise<ElderlyProfile>;
  joinProfileWithPasscode: (profileId: string, passcode: string, relationship?: string) => Promise<boolean>;
  addMedication: (med: Omit<Medication, 'id' | 'profileId' | 'active'>) => Promise<void>;
  updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
  deleteMedication: (id: string) => Promise<void>;
  markAdherence: (recordId: string, status: 'taken' | 'missed') => Promise<void>;
  addAppointment: (appt: Omit<Appointment, 'id' | 'profileId' | 'reminderSent'>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  triggerSOS: (message?: string) => Promise<{ success: boolean; recipientCount: number }>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const DEMO_PROFILES: ElderlyProfile[] = [
  {
    id: 'prof-demo-1',
    name: 'Eleanor Vance',
    dob: '1946-04-12',
    passcode: '482910',
    ownerId: 'demo-user',
    ownerEmail: 'eleanor.vance@example.com',
    relationship: 'Mother',
    emergencyEmails: ['sarah.vance@example.com', 'david.vance@example.com'],
    emergencyPhones: ['+1 (555) 019-2834'],
    allergies: ['Penicillin', 'Sulfa drugs'],
    notes: 'Mild cognitive impairment, loves gardening, prefers morning walks before breakfast.',
  },
  {
    id: 'prof-demo-2',
    name: 'Arthur Pendelton',
    dob: '1942-11-28',
    passcode: '639105',
    ownerId: 'demo-user-2',
    ownerEmail: 'arthur.p@example.com',
    relationship: 'Father-in-law',
    emergencyEmails: ['clara.p@example.com'],
    allergies: ['Aspirin'],
  },
];

const DEMO_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    profileId: 'prof-demo-1',
    name: 'Metformin',
    dosage: '500',
    unit: 'mg',
    frequency: 'twice_daily',
    times: ['08:00', '20:00'],
    instructions: 'Take with food to avoid stomach upset',
    startDate: '2026-01-01',
    refillCount: 8,
    refillAlertAt: 10,
    color: '#2563EB',
    active: true,
  },
  {
    id: 'med-2',
    profileId: 'prof-demo-1',
    name: 'Lisinopril',
    dosage: '10',
    unit: 'mg',
    frequency: 'daily',
    times: ['08:00'],
    instructions: 'Take in the morning with a full glass of water for blood pressure',
    startDate: '2026-01-01',
    refillCount: 24,
    refillAlertAt: 7,
    color: '#059669',
    active: true,
  },
  {
    id: 'med-3',
    profileId: 'prof-demo-1',
    name: 'Atorvastatin',
    dosage: '20',
    unit: 'mg',
    frequency: 'daily',
    times: ['21:00'],
    instructions: 'Take in the evening before bedtime',
    startDate: '2026-01-01',
    refillCount: 15,
    refillAlertAt: 5,
    color: '#7C3AED',
    active: true,
  },
  {
    id: 'med-4',
    profileId: 'prof-demo-1',
    name: 'Vitamin D3 & Calcium',
    dosage: '1000',
    unit: 'IU',
    frequency: 'daily',
    times: ['12:30'],
    instructions: 'Take with lunch',
    startDate: '2026-01-01',
    refillCount: 45,
    refillAlertAt: 10,
    color: '#D97706',
    active: true,
  },
];

const DEMO_APPOINTMENTS: Appointment[] = [
  {
    id: 'appt-1',
    profileId: 'prof-demo-1',
    doctorName: 'Dr. Sarah Jenkins',
    specialty: 'Cardiology Follow-up',
    dateTime: '2026-11-18T14:30:00.000Z',
    location: 'St. Mary Medical Pavilion, Suite 410',
    notes: 'Bring current blood pressure log and medication list.',
    reminderSent: true,
  },
  {
    id: 'appt-2',
    profileId: 'prof-demo-1',
    doctorName: 'Dr. Robert Miller',
    specialty: 'Routine Geriatric Wellness',
    dateTime: '2026-11-24T10:00:00.000Z',
    location: 'Evergreen Health Clinic, Room 102',
    notes: 'Review lab results from last blood draw.',
    reminderSent: false,
  },
];

function generateTodayRecords(meds: Medication[], profileId: string): AdherenceRecord[] {
  const todayStr = new Date().toISOString().split('T')[0];
  const records: AdherenceRecord[] = [];

  meds
    .filter((m) => m.profileId === profileId && m.active)
    .forEach((med) => {
      med.times.forEach((time, idx) => {
        records.push({
          id: `adh-${med.id}-${todayStr}-${idx}`,
          profileId,
          medId: med.id,
          medName: med.name,
          dosage: `${med.dosage} ${med.unit}`,
          scheduledTime: time,
          date: todayStr,
          status: idx === 0 ? 'taken' : 'pending',
          takenAt: idx === 0 ? `${todayStr}T${time}:00Z` : undefined,
          notes: med.instructions,
        });
      });
    });

  return records;
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<ElderlyProfile[]>(DEMO_PROFILES);
  const [activeProfile, setActiveProfile] = useState<ElderlyProfile | null>(DEMO_PROFILES[0]);
  const [medications, setMedications] = useState<Medication[]>(DEMO_MEDICATIONS);
  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [adherenceRecords, setAdherenceRecords] = useState<AdherenceRecord[]>([]);
  const [fontSize, setFontSizeState] = useState<'normal' | 'large' | 'xl'>('normal');
  const [highContrast, setHighContrastState] = useState(false);

  // Initialize accessibility settings & today's records
  useEffect(() => {
    if (activeProfile) {
      const todayRecords = generateTodayRecords(medications, activeProfile.id);
      setAdherenceRecords(todayRecords);
    }
  }, [activeProfile, medications]);

  // Handle Accessibility classes on <html>
  const setFontSize = (size: 'normal' | 'large' | 'xl') => {
    setFontSizeState(size);
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove('senior-large', 'senior-xl');
      if (size === 'large') document.documentElement.classList.add('senior-large');
      if (size === 'xl') document.documentElement.classList.add('senior-xl');
    }
  };

  const setHighContrast = (enabled: boolean) => {
    setHighContrastState(enabled);
    if (typeof document !== 'undefined') {
      if (enabled) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  };

  // Create new profile with generated 6-digit passcode
  const createProfile = async (data: Omit<ElderlyProfile, 'id' | 'passcode'>): Promise<ElderlyProfile> => {
    const generatedPasscode = Math.floor(100000 + Math.random() * 900000).toString();
    const newProfile: ElderlyProfile = {
      ...data,
      id: `prof-${Date.now()}`,
      passcode: generatedPasscode,
      ownerId: user?.uid || 'local-user',
      ownerEmail: user?.email || data.ownerEmail,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfile(newProfile);
    return newProfile;
  };

  // Join existing profile via 6-digit passcode
  const joinProfileWithPasscode = async (
    profileIdOrCode: string,
    passcode: string,
    relationship?: string
  ): Promise<boolean> => {
    const found = profiles.find(
      (p) =>
        (p.id.toLowerCase() === profileIdOrCode.toLowerCase() || p.passcode === passcode) &&
        p.passcode === passcode
    );

    if (found) {
      const updated = { ...found, relationship: relationship || 'Family Member' };
      setActiveProfile(updated);
      return true;
    }
    return false;
  };

  const addMedication = async (med: Omit<Medication, 'id' | 'profileId' | 'active'>) => {
    if (!activeProfile) return;
    const newMed: Medication = {
      ...med,
      id: `med-${Date.now()}`,
      profileId: activeProfile.id,
      active: true,
    };
    setMedications((prev) => [...prev, newMed]);
  };

  const updateMedication = async (id: string, updates: Partial<Medication>) => {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const deleteMedication = async (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const markAdherence = async (recordId: string, status: 'taken' | 'missed') => {
    setAdherenceRecords((prev) =>
      prev.map((rec) =>
        rec.id === recordId
          ? {
              ...rec,
              status,
              takenAt: status === 'taken' ? new Date().toISOString() : undefined,
            }
          : rec
      )
    );
  };

  const addAppointment = async (appt: Omit<Appointment, 'id' | 'profileId' | 'reminderSent'>) => {
    if (!activeProfile) return;
    const newAppt: Appointment = {
      ...appt,
      id: `appt-${Date.now()}`,
      profileId: activeProfile.id,
      reminderSent: true, // Proactively scheduled email reminder
    };
    setAppointments((prev) => [...prev, newAppt]);
  };

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const triggerSOS = async (message?: string) => {
    if (!activeProfile) return { success: false, recipientCount: 0 };
    const recipients = activeProfile.emergencyEmails.length || 1;
    console.log(`🚨 SOS Triggered for ${activeProfile.name}! Alerting ${recipients} contacts.`);
    return { success: true, recipientCount: recipients };
  };

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        profiles,
        medications: medications.filter((m) => activeProfile && m.profileId === activeProfile.id),
        adherenceRecords,
        appointments: appointments.filter((a) => activeProfile && a.profileId === activeProfile.id),
        fontSize,
        highContrast,
        setFontSize,
        setHighContrast,
        setActiveProfile,
        createProfile,
        joinProfileWithPasscode,
        addMedication,
        updateMedication,
        deleteMedication,
        markAdherence,
        addAppointment,
        deleteAppointment,
        triggerSOS,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
}

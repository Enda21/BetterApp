
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TrueCoachWorkout {
  id: string;
  title: string;
  scheduled_for: string;
  exercises: TrueCoachExercise[];
  notes?: string;
}

export interface TrueCoachExercise {
  id: string;
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  notes?: string;
  video_url?: string;
}

class TrueCoachAPI {
  private baseURL = 'https://api.truecoach.co/v1';
  private apiKey: string | null = null;

  async setApiKey(key: string) {
    this.apiKey = key;
    await AsyncStorage.setItem('truecoach_api_key', key);
  }

  async getApiKey(): Promise<string | null> {
    if (!this.apiKey) {
      this.apiKey = await AsyncStorage.getItem('truecoach_api_key');
    }
    return this.apiKey;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const apiKey = await this.getApiKey();
    if (!apiKey) {
      throw new Error('TrueCoach API key not set');
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`TrueCoach API error: ${response.statusText}`);
    }

    return response.json();
  }

  async getWorkouts(startDate: string, endDate: string): Promise<TrueCoachWorkout[]> {
    try {
      const data = await this.makeRequest(
        `/workouts?scheduled_for_start=${startDate}&scheduled_for_end=${endDate}`
      );
      return data.workouts || [];
    } catch (error) {
      console.error('Error fetching TrueCoach workouts:', error);
      return [];
    }
  }

  async updateWorkoutNotes(workoutId: string, notes: string): Promise<boolean> {
    try {
      await this.makeRequest(`/workouts/${workoutId}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      });
      return true;
    } catch (error) {
      console.error('Error updating workout notes:', error);
      return false;
    }
  }
}

export default new TrueCoachAPI();

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Linking, Image, ScrollView, Alert, ActivityIndicator, Modal
} from 'react-native';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import TrueCoachAPI, { TrueCoachWorkout } from '../services/TrueCoachAPI';

const generateWeekDays = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

type Exercise = {
  name: string;
  sets?: number;
  reps?: number;
  weight?: string;
  notes?: string;
  video?: string;
};

type Workout = {
  id: string;
  title: string;
  date: Date;
  exercises: Exercise[];
};

type WorkoutsByDay = {
  [day: string]: Workout[];
};

const initialWorkouts: WorkoutsByDay = {
  Monday: [
    {
      id: '1',
      title: 'Upper Body',
      date: new Date(),
      exercises: [
        {
          name: 'Bench Press',
          sets: 4,
          reps: 8,
          weight: '80kg',
          notes: '',
          video: 'https://www.youtube.com/watch?v=SCVCLChPQFY'
        },
        {
          name: 'Pull-Up',
          sets: 3,
          reps: 10,
          weight: 'Bodyweight',
          notes: '',
          video: ''
        }
      ]
    }
  ],
  Tuesday: [
    {
      id: '2',
      title: 'Lower Body',
      date: new Date(),
      exercises: [
        {
          name: 'Squat',
          sets: 4,
          reps: 6,
          weight: '100kg',
          notes: '',
          video: 'https://www.youtube.com/watch?v=U3HlEF_E9fo'
        }
      ]
    }
  ],
  Wednesday: [
    {
      id: '3',
      title: 'Tempo Run',
      date: new Date(),
      exercises: [
        {
        name: 'Tempo Run',
        sets: 0,
        reps: 0,
        weight: '',
        notes: '5 KM RUN 5:00km/Min Pace',
        video: ''
        }
      ]
    }
  ],
  Thursday: [
    {
      id: '4',
      title: 'Upper Body',
      date: new Date(),
      exercises: [
        {
          name: 'Bench Press',
          sets: 4,
          reps: 8,
          weight: '80kg',
          notes: '',
          video: 'https://www.youtube.com/watch?v=SCVCLChPQFY'
        },
        {
          name: 'Pull-Up',
          sets: 3,
          reps: 10,
          weight: 'Bodyweight',
          notes: '',
          video: ''
        }
      ]
    }
  ],
  Friday: [
    {
      id: '5',
      title: 'HyRox Session',
      date: new Date(),
      exercises: [
        {
          name: 'Sled Push',
          sets: 4,
          reps: 8,
          weight: '80kg',
          notes: '',
          video: 'https://www.youtube.com/watch?v=SCVCLChPQFY'
        },
        {
          name: 'SKI Erg',
          sets: 3,
          reps: 10,
          weight: '',
          notes: '',
          video: ''
        }
      ]
    }
  ],
  Saturday: [
    {
      id: '6',
      title: 'Weekly Review',
      date: new Date(),
      exercises: [
        {
          name: 'Rapid Fire',
          video: 'https://kmfitnesscoaching.typeform.com/Rapidfire'
        },
        {
          name: 'Progress Pit Stop',
          video: 'https://kmfitnesscoaching.typeform.com/pitstopsessions'
        }
      ]
    }
  ],
};

const TrainingPlan = () => {
  const weekDays = generateWeekDays();
  const [selectedDay, setSelectedDay] = useState<string>(format(new Date(), 'EEEE'));
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [workoutsByDay, setWorkoutsByDay] = useState<WorkoutsByDay>(initialWorkouts);
  const [trueCoachWorkouts, setTrueCoachWorkouts] = useState<TrueCoachWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useTrueCoach, setUseTrueCoach] = useState(false);
  // Track completion state for each exercise by workoutId and exerciseIndex
  type CompletionState = 0 | 1 | 2;
  type ExerciseCompletion = { [workoutId: string]: { [exerciseIndex: number]: CompletionState } };
  const [exerciseCompletion, setExerciseCompletion] = useState<ExerciseCompletion>({});

  // 0 = grey tick, 1 = green tick, 2 = red X
  const getCompletionIcon = (state: CompletionState): string => {
    if (state === 1) return '✅';
    if (state === 2) return '❌';
    return '✔️';
  };

  const getCompletionColor = (state: CompletionState): string => {
    if (state === 1) return '#10B981'; // green
    if (state === 2) return '#EF4444'; // red
    return '#A1A1AA'; // grey
  };

  const handleToggleExerciseComplete = (workoutId: string, exerciseIndex: number): void => {
    setExerciseCompletion(prev => {
      const workoutState = prev[workoutId] || {};
      const current = workoutState[exerciseIndex] || 0;
      let next: CompletionState;
      if (current === 0) next = 1;
      else if (current === 1) next = 2;
      else next = 1;
      return {
        ...prev,
        [workoutId]: {
          ...workoutState,
          [exerciseIndex]: next,
        },
      };
    });
  };

  useEffect(() => {
    checkTrueCoachConnection();
  }, []);

  const checkTrueCoachConnection = async (): Promise<void> => {
    const apiKey = await TrueCoachAPI.getApiKey();
    if (apiKey) {
      setUseTrueCoach(true);
      fetchTrueCoachWorkouts();
    }
  };

  const fetchTrueCoachWorkouts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const startDate = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const endDate = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const workouts = await TrueCoachAPI.getWorkouts(startDate, endDate);
      setTrueCoachWorkouts(workouts);
      organizeTrueCoachWorkouts(workouts);
    } catch (error) {
      console.error('Failed to fetch TrueCoach workouts:', error);
      Alert.alert('Error', 'Failed to fetch workouts from TrueCoach');
    } finally {
      setIsLoading(false);
    }
  };

  const organizeTrueCoachWorkouts = (workouts: TrueCoachWorkout[]): void => {
    const organized: WorkoutsByDay = {};

    workouts.forEach(workout => {
      const day = format(new Date(workout.scheduled_for), 'EEEE');
      if (!organized[day]) {
        organized[day] = [];
      }

      organized[day].push({
        id: workout.id,
        title: workout.title,
        date: new Date(workout.scheduled_for),
        exercises: workout.exercises.map(ex => ({
          name: ex.name,
          sets: ex.sets || 0,
          reps: ex.reps || 0,
          weight: ex.weight || '',
          notes: ex.notes || '',
          video: ex.video_url || ''
        }))
      });
    });

    setWorkoutsByDay(organized);
  };

  const setupTrueCoach = (): void => {
    Alert.prompt(
      'TrueCoach API Key',
      'Enter your TrueCoach API key to sync workouts:',
      async (apiKey) => {
        if (apiKey) {
          await TrueCoachAPI.setApiKey(apiKey);
          setUseTrueCoach(true);
          fetchTrueCoachWorkouts();
        }
      }
    );
  };

  const handleDateConfirm = (date: Date): void => {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const nextWeekStart = addDays(currentWeekStart, 7);

    // Check if selected date is within current week
    if (date >= nextWeekStart) {
      alert('You can only move workouts within the current week');
      setDatePickerVisibility(false);
      return;
    }

    const newDay = format(date, 'EEEE');
    const updated = { ...workoutsByDay };

    const currentDayWorkouts = updated[selectedDay] || [];
    const workoutToMove = currentDayWorkouts.find((w: Workout) => w.id === selectedWorkoutId);

    if (!workoutToMove) return;

    updated[selectedDay] = currentDayWorkouts.filter((w: Workout) => w.id !== selectedWorkoutId);

    const updatedWorkout = {
      ...workoutToMove,
      date,
      id: `${workoutToMove.id}-${Date.now()}`
    };

    if (!updated[newDay]) updated[newDay] = [];
    updated[newDay].push(updatedWorkout);

    setWorkoutsByDay(updated);
    setSelectedDay(newDay);
    setDatePickerVisibility(false);
  };

  const handleNoteChange = async (workoutIndex: number, exerciseIndex: number, text: string): Promise<void> => {
    const updated = { ...workoutsByDay };
    updated[selectedDay][workoutIndex].exercises[exerciseIndex].notes = text;
    setWorkoutsByDay(updated);

    // Sync with TrueCoach if connected
    if (useTrueCoach) {
      const workoutId = updated[selectedDay][workoutIndex].id;
      await TrueCoachAPI.updateWorkoutNotes(workoutId, text);
    }
  };

  const renderVideoThumbnail = (url: string): React.ReactElement | null => {
    if (!url) return null;
    if (url.includes('typeform.com')) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.buttonLink}>
          <Text style={styles.buttonText}>Open Form</Text>
        </TouchableOpacity>
      );
    }
    const videoId = url.split('v=')[1];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    return (
      <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.videoContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>▶</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Training Plan</Text>
        <View style={styles.headerControls}>
          {!useTrueCoach ? (
            <TouchableOpacity onPress={setupTrueCoach} style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Connect TrueCoach</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.syncStatus}>
              <Text style={styles.syncStatusText}>✓ TrueCoach Connected</Text>
              <TouchableOpacity onPress={fetchTrueCoachWorkouts} style={styles.refreshButton}>
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.daySelectorContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {weekDays.map((day) => {
            const dayName = format(day, 'EEEE');
            const isSelected = selectedDay === dayName;
            return (
              <TouchableOpacity
                key={dayName}
                onPress={() => setSelectedDay(dayName)}
                style={[
                  styles.dayButton,
                  isSelected && styles.selectedDay
                ]}
              >
                <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                  {format(day, 'EEE')}
                </Text>
                <Text style={[styles.dateText, isSelected && styles.selectedDateText]}>
                  {format(day, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4B3BE7" />
            <Text style={styles.loadingText}>Syncing with TrueCoach...</Text>
          </View>
        ) : (workoutsByDay[selectedDay] && workoutsByDay[selectedDay].length > 0) ? (
          workoutsByDay[selectedDay].map((item: Workout, workoutIndex: number) => (
            <View key={item.id} style={styles.workoutCard}>
              <View style={styles.dateHeader}>
                <TouchableOpacity
                  style={styles.dateHeaderTouchable}
                  onPress={() => {
                    if (!useTrueCoach) {
                      setSelectedWorkoutId(item.id);
                      setDatePickerVisibility(true);
                    }
                  }}
                >
                  <Text style={styles.workoutTitle}>{item.title}</Text>
                  <Text style={styles.dateLabel}>{format(item.date, 'MMM d')}</Text>
                  {useTrueCoach && <Text style={styles.trueCoachBadge}>TC</Text>}
                </TouchableOpacity>
              </View>

              {item.exercises.map((ex, exerciseIndex) => (
                <View key={`${item.id}-${exerciseIndex}`} style={styles.exerciseCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      {((ex.sets ?? 0) > 0 || (ex.reps ?? 0) > 0) && (
                        <Text style={styles.exerciseDetails}>
                          {(ex.sets ?? 0)}x{(ex.reps ?? 0)} {ex.weight && `@ ${ex.weight}`}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.completeButton, { backgroundColor: getCompletionColor((exerciseCompletion[item.id]?.[exerciseIndex]) ?? 0) }]}
                      onPress={() => handleToggleExerciseComplete(item.id, exerciseIndex)}
                    >
                      <Text style={styles.completeIcon}>{getCompletionIcon((exerciseCompletion[item.id]?.[exerciseIndex]) ?? 0)}</Text>
                    </TouchableOpacity>
                  </View>
                  {renderVideoThumbnail(ex.video ?? '')}
                  <TextInput
                    style={styles.notesInput}
                    placeholder="Add notes..."
                    value={ex.notes}
                    onChangeText={(text) => handleNoteChange(workoutIndex, exerciseIndex, text)}
                    multiline
                  />
                </View>
              ))}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {useTrueCoach ? 'No workouts scheduled' : 'Rest Day'}
            </Text>
            {!useTrueCoach && (
              <TouchableOpacity onPress={setupTrueCoach} style={styles.connectButton}>
                <Text style={styles.connectButtonText}>Connect TrueCoach for Live Data</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Custom Modal Date Picker for Current Week */}
      <Modal
        visible={isDatePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setDatePickerVisibility(false)}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)'
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            width: 300,
            alignItems: 'center'
          }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Select a Day</Text>
            {weekDays.map((date) => (
              <TouchableOpacity
                key={date.toISOString()}
                style={{
                  padding: 12,
                  marginVertical: 4,
                  borderRadius: 8,
                  backgroundColor: '#F5F6F7',
                  width: '100%',
                  alignItems: 'center'
                }}
                onPress={() => {
                  handleDateConfirm(date);
                  setDatePickerVisibility(false);
                }}
              >
                <Text style={{ fontSize: 16 }}>
                  {format(date, 'EEEE, MMM d')}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setDatePickerVisibility(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: '#4B3BE7', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerControls: {
    marginTop: 10,
  },
  syncButton: {
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncStatusText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  refreshButtonText: {
    color: '#4B3BE7',
    fontSize: 12,
    fontWeight: '600',
  },
  trueCoachBadge: {
    backgroundColor: '#10B981',
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  connectButton: {
    marginTop: 20,
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  daySelectorContainer: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  daySelector: {
    paddingHorizontal: 15,
  },
  dayButton: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
    borderRadius: 12,
    backgroundColor: '#F5F6F7',
  },
  selectedDay: {
    backgroundColor: '#4B3BE7',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  selectedDayText: {
    color: '#fff',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 4,
  },
  selectedDateText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  workoutCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
    position: 'relative',
  },
  dateHeaderTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  completeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  dateLabel: {
    fontSize: 14,
    color: '#4B3BE7',
    fontWeight: '600',
  },
  exerciseCard: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  videoContainer: {
    position: 'relative',
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    backgroundColor: '#F5F6F7',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  notesInput: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F5F6F7',
    fontSize: 14,
    color: '#1A1A1A',
    minHeight: 80,
  },
  buttonLink: {
    backgroundColor: '#4B3BE7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
});

export default TrainingPlan;
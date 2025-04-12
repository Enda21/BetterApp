import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Linking, Image, ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, addDays, startOfWeek } from 'date-fns';

const generateWeekDays = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Start on Monday
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

const initialWorkouts = {
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
  // Add more days as needed...
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
  const [selectedDay, setSelectedDay] = useState(format(new Date(), 'EEEE'));
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [workoutsByDay, setWorkoutsByDay] = useState(initialWorkouts);

 ///////handDate/////
 const handleDateConfirm = (date) => {
  const newDay = format(date, 'EEEE');
  const updated = { ...workoutsByDay };

  const currentDayWorkouts = updated[selectedDay] || [];
  const workoutToMove = currentDayWorkouts.find((w) => w.id === selectedWorkoutId);

  if (!workoutToMove) return;

  // Remove from old day
  updated[selectedDay] = currentDayWorkouts.filter((w) => w.id !== selectedWorkoutId);

  // Ensure unique ID by appending timestamp or regenerating
  const updatedWorkout = {
    ...workoutToMove,
    date,
    id: `${workoutToMove.id}-${Date.now()}`
  };

  // Add to new day
  if (!updated[newDay]) updated[newDay] = [];
  updated[newDay].push(updatedWorkout);

  setWorkoutsByDay(updated);
  setSelectedDay(newDay);
  setDatePickerVisibility(false);
};
/////////////
  const handleNoteChange = (index, text) => {
    const updated = { ...workoutsByDay };
    updated[selectedDay][0].exercises[index].notes = text;
    setWorkoutsByDay(updated);
  };

  const renderVideoThumbnail = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1];
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/0.jpg`;
    return (
      <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.videoContainer}>
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
        <Text style={styles.videoLink}>▶ Play Video</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
<View style={styles.daySelectorContainer}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
    {weekDays.map((day) => {
      const dayName = format(day, 'EEEE');
      return (
        <TouchableOpacity
          key={dayName}
          onPress={() => setSelectedDay(dayName)}
          style={[
            styles.dayButton,
            selectedDay === dayName && styles.selectedDay
          ]}
        >
          <Text style={styles.dayText}>{dayName.slice(0, 3)}</Text>
          <Text style={styles.dateText}>{format(day, 'MMM d')}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
</View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      {(workoutsByDay[selectedDay] && workoutsByDay[selectedDay].length > 0) ? (
      workoutsByDay[selectedDay].map((item) => (
    <View key={item.id} style={styles.card}>
      <Text style={styles.title}>{item.title}</Text>
      <TouchableOpacity onPress={() => {
        setSelectedWorkoutId(item.id);
        setDatePickerVisibility(true);
      }}>
        <Text style={styles.date}>{format(item.date, 'EEEE, MMM dd')}</Text>
      </TouchableOpacity>

      {item.exercises.map((ex, index) => (
        <View key={`${item.id}-${index}`} style={styles.exerciseCard}>
          <Text style={styles.exerciseTitle}>{ex.name}</Text>
          <Text style={styles.detail}>Sets: {ex.sets}  Reps: {ex.reps}  Weight: {ex.weight}</Text>
          {renderVideoThumbnail(ex.video)}
          <TextInput
            style={styles.notes}
            placeholder="Add notes..."
            value={ex.notes}
            onChangeText={(text) => handleNoteChange(index, text)}
            multiline
          />
        </View>
      ))}
    </View>
  ))
) : (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>No workouts scheduled for this day.</Text>
  </View>
)}
</ScrollView>

      {isDatePickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (event.type === 'set' && selectedDate) {
              handleDateConfirm(selectedDate);
            }
            setDatePickerVisibility(false);
          }}
        />
      )}
    </View>
  );
};

export default TrainingPlan;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 16, backgroundColor: '#f8f9fa' },
  placeholderContainer: {
    marginTop: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: '#aaa',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  daySelectorContainer: {
    height: 90, // lock height
    justifyContent: 'center',
  },
  daySelector: { marginBottom: 16 },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: '#eaeaea',
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  selectedDay: {
    backgroundColor: '#007aff',
  },
  dayText: { fontSize: 16, fontWeight: '600', color: '#333' },
  dateText: { fontSize: 14, color: '#666' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#000', // logo color
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4, // Android shadow
  },
  cardHeaderAccent: {
    height: 4,
    width: '100%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000', // consistent with the brand
    marginBottom: 6,
  },
  date: {
    fontSize: 16,
    color: '#007aff', // secondary color
    marginBottom: 12,
  },  
  exerciseCard: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
    marginBottom: 12,
  },
  exerciseTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  detail: { fontSize: 16, color: '#333' },
  notes: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 15,
    backgroundColor: '#fafafa',
  },
  videoContainer: { marginTop: 10, alignItems: 'center' },
  thumbnail: { width: '100%', height: 180, borderRadius: 8 },
  videoLink: { marginTop: 6, color: '#007aff', fontWeight: '500' },
});
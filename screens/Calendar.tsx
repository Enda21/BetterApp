
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameDay, isSameMonth } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  description: string;
  location?: string;
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    loadEvents();
    addMensayEvent(); // Add the Men's Day event from the announcement
  }, []);

  const addMensayEvent = async () => {
    const mensayEvent: CalendarEvent = {
      id: 'mensdaysu mmer2024',
      title: "Men's Day SUMMER MEET UP",
      date: new Date(2024, 5, 28), // June 28, 2024 (month is 0-indexed)
      time: '9:15 AM',
      description: `📍 9:15 am — Meet in Lahinch Car Park near enough to the gym
⏰ 9:30 am - Group warm up and stretch
💪 10 am - Team Building Training Session
🏖️ 11 am - walk and a dip on Lahinch beach / shower and change
🍞 12:30 - 2 pm - break bread together at Pot Duggans (5 min drive from Lahinch)

👥 Bring a +1 (friend, brother, or someone who is interested in improving themselves)
📍 Lahinch gym - Lahinch, County Clare
🆓 Free for clients`,
      location: 'Lahinch, County Clare'
    };

    const existingEvents = await loadEvents();
    const eventExists = existingEvents.some(event => event.id === mensayEvent.id);
    
    if (!eventExists) {
      const updatedEvents = [...existingEvents, mensayEvent];
      setEvents(updatedEvents);
      await saveEvents(updatedEvents);
    }
  };

  const loadEvents = async (): Promise<CalendarEvent[]> => {
    try {
      const storedEvents = await AsyncStorage.getItem('calendar_events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setEvents(parsedEvents);
        return parsedEvents;
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
    return [];
  };

  const saveEvents = async (eventsToSave: CalendarEvent[]) => {
    try {
      await AsyncStorage.setItem('calendar_events', JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Error saving events:', error);
    }
  };

  

  const renderCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = [];
    let day = start;

    while (day <= end) {
      const dayEvents = events.filter(event => isSameDay(event.date, day));
      const isSelected = isSameDay(day, selectedDate);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isToday = isSameDay(day, new Date());

      days.push(
        <TouchableOpacity
          key={day.toISOString()}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            !isCurrentMonth && styles.otherMonthDay,
            isToday && styles.today
          ]}
          onPress={() => setSelectedDate(new Date(day))}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            !isCurrentMonth && styles.otherMonthText,
            isToday && styles.todayText
          ]}>
            {format(day, 'd')}
          </Text>
          {dayEvents.length > 0 && (
            <View style={styles.eventIndicator}>
              <Text style={styles.eventCount}>{dayEvents.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
      day = addDays(day, 1);
    }

    return days;
  };

  const getEventsForSelectedDate = () => {
    return events.filter(event => isSameDay(event.date, selectedDate));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateMonth('prev')}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {format(currentDate, 'MMMM yyyy')}
        </Text>
        <TouchableOpacity onPress={() => navigateMonth('next')}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.daysGrid}>
          {renderCalendarDays()}
        </View>
      </View>

      {/* Selected Date Events */}
      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <Text style={styles.eventsTitle}>
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </Text>
        </View>

        <ScrollView style={styles.eventsList}>
          {getEventsForSelectedDate().map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
              </View>
              <Text style={styles.eventTime}>{event.time}</Text>
              {event.location && (
                <Text style={styles.eventLocation}>📍 {event.location}</Text>
              )}
              {event.description && (
                <Text style={styles.eventDescription}>{event.description}</Text>
              )}
            </View>
          ))}
          {getEventsForSelectedDate().length === 0 && (
            <Text style={styles.noEvents}>No events for this date</Text>
          )}
        </ScrollView>
      </View>

      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  navButton: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B3BE7',
    paddingHorizontal: 15,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  calendar: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  dayHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    width: 40,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: '#4B3BE7',
    borderRadius: 20,
  },
  today: {
    backgroundColor: '#FEF3C7',
    borderRadius: 20,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '600',
    color: '#D97706',
  },
  otherMonthText: {
    color: '#999',
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCount: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  eventsSection: {
    flex: 1,
    margin: 15,
    marginTop: 0,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addButton: {
    backgroundColor: '#4B3BE7',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  deleteButton: {
    fontSize: 20,
    color: '#EF4444',
    fontWeight: 'bold',
    paddingLeft: 10,
  },
  eventTime: {
    fontSize: 14,
    color: '#4B3BE7',
    fontWeight: '600',
    marginTop: 5,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  noEvents: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E4E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E4E8',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4B3BE7',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Calendar;

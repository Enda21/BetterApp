import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Dimensions 
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

interface Course {
  id: string;
  title: string;
  videoId: string;
  description?: string;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Come Back From Holidays Looking & Feeling Better',
    videoId: 'k5EhZX1kMzQ',
    description: 'Without Sacrificing Drinks Or Foods'
  },
  {
    id: '2',
    title: 'Peak Performance Roundtable With 3 Leaders',
    videoId: '',
  },
  {
    id: '3',
    title: '"Stuck In The Man Box"',
    videoId: '',
  },
  {
    id: '4',
    title: 'Goals Audit For 2024: Commitment Season',
    videoId: '',
  },
  {
    id: '5',
    title: 'Better Man Awards And Yearly Review (2024)',
    videoId: '',
  },
  {
    id: '6',
    title: 'Goal Setting For 2025',
    videoId: '',
  },
  {
    id: '7',
    title: '48hr Hols Recovery Protocol To Accelerate',
    videoId: '',
  },
];

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);

  const getVideoEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=*`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Monthly Masterclass</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>0%</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>August Masterclass</Text>
          <ScrollView style={styles.courseList}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseItem,
                  selectedCourse.id === course.id && styles.courseItemSelected
                ]}
                onPress={() => setSelectedCourse(course)}
              >
                <Text style={[
                  styles.courseItemText,
                  selectedCourse.id === course.id && styles.courseItemTextSelected
                ]}>
                  {course.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          <View style={styles.videoHeader}>
            <Text style={styles.videoTitle}>{selectedCourse.title}</Text>
            <TouchableOpacity style={styles.completedButton}>
              <Text style={styles.completedButtonText}>✓</Text>
            </TouchableOpacity>
          </View>

          {selectedCourse.videoId ? (
            <View style={styles.videoContainer}>
              <WebView
                source={{ uri: getVideoEmbedUrl(selectedCourse.videoId) }}
                style={styles.webview}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                mixedContentMode="compatibility"
              />
            </View>
          ) : (
            <View style={styles.noVideoContainer}>
              <Text style={styles.noVideoText}>Video coming soon</Text>
            </View>
          )}

          {selectedCourse.description && (
            <Text style={styles.description}>{selectedCourse.description}</Text>
          )}
        </View>
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
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E4E8',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E1E4E8',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    width: '0%',
    backgroundColor: '#4B3BE7',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: width * 0.35,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: '#E1E4E8',
    paddingVertical: 20,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  courseList: {
    flex: 1,
  },
  courseItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  courseItemSelected: {
    backgroundColor: '#FFF9E6',
    borderRightWidth: 3,
    borderRightColor: '#F59E0B',
  },
  courseItemText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  courseItemTextSelected: {
    color: '#1A1A1A',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  videoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    lineHeight: 28,
  },
  completedButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E1E4E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  completedButtonText: {
    fontSize: 18,
    color: '#666',
  },
  videoContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  webview: {
    flex: 1,
  },
  noVideoContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noVideoText: {
    fontSize: 18,
    color: '#666',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
});

export default Courses;

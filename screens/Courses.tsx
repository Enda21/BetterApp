import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// A small set of sample lessons that include text content and an embeddable video URL.
// These use YouTube embed URLs so the video can be shown inside a WebView in the app.
// You can replace videoUrl with links to hosted mp4 files or other providers later.
const SUB_COURSES = [
  {
    id: '1.1',
    title: 'Rules Of Engagement: How We Communicate',
    summary: 'Quick intro to how we communicate inside the program and how to get the most from coaching.',
    videoUrl: 'https://www.youtube.com/watch?v=leomEnFp7UE',
    externalUrl: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=5b49cbbee3f3443a9ff2a83c4ef30d7d'
  },
  {
    id: '1.2',
    title: 'How To Look At Your Training',
    summary: 'How to read your program, track progress and understand training cues.',
    videoUrl: 'https://www.youtube.com/watch?v=OimLQbPLsdA',
    externalUrl: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=89d09a3ef3b746afb794fa073dbcb0e0'
  },
  {
    id: '1.3',
    title: 'How To View And Log Your Nutrition',
    summary: 'A quick walkthrough of the nutrition logging process and tips for accuracy.',
    videoUrl: 'https://www.youtube.com/watch?v=LQJqvuWnGHo',
    externalUrl: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=0ccf6347631645dd807355aec93e2dd0'
  },
  {
    id: '1.4',
    title: ' What To Expect Inside The First 30 Days',
    summary: 'What To Expect Inside The First 30 Days',
    videoUrl: 'https://www.youtube.com/watch?v=1PiyqtHw19I',
    externalUrl: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=6ec1abffaaa945ffbd2dd6e119708f16'
  },
   {
    id: '1.5',
    title: 'How to Take Progress Photos',
    summary: 'How to Take Progress Photos',
    videoUrl: 'https://www.youtube.com/watch?v=hATH69EZ2vs',
    externalUrl: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=177714bb230d4d7ca2b4f7e7786979e1'
  },
   {
    id: '1.6',
    title: 'Truecoach Tutorial',
    summary: 'Truecoach Tutorial',
    videoUrl: 'https://www.youtube.com/watch?v=pveP_iETP3c',
    externalUrl: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=d382e85abc1643f49c5009d3bc767487'
  }
];


const Courses = () => {
  const navigation: any = useNavigation();

  const handleSubCoursePress = (lesson: any) => {
    // Navigate into the in-app lesson viewer and pass the lesson.
    navigation.navigate('Lesson', { lesson });
  };

  const handleOpenExternal = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Member Launch Pad</Text>
      </View>
      <View style={styles.content}>
        <ScrollView style={styles.subCourseList}>
          {SUB_COURSES.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={styles.subCourseItem}
              onPress={() => handleSubCoursePress(sub)}
            >
              <Text style={styles.subCourseText}>{sub.id} {sub.title}</Text>
              <Text style={styles.subCourseSummary}>{sub.summary}</Text>
            </TouchableOpacity>
          ))}

          <View style={{height: 10}} />
          <Text style={{color: '#666', marginBottom: 8}}>Open original lessons in browser:</Text>
          {SUB_COURSES.map((sub) => (
            <TouchableOpacity key={`ext-${sub.id}`} onPress={() => handleOpenExternal(sub.externalUrl)}>
              <Text style={{color: '#0947aa', marginBottom: 6}}>{sub.id} - Open in browser</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1EFE7',
  },
  header: {
    backgroundColor: '#0947aaff',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  subCourseList: {
    flex: 1,
  },
  subCourseItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#4B3BE7',
  },
  subCourseText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  subCourseSummary: {
    marginTop: 8,
    color: '#444',
    fontSize: 14,
  },
});

export default Courses;
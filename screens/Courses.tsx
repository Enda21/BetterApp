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

const { width } = Dimensions.get('window');

const SUB_COURSES = [
  { 
    id: '1.1', 
    title: 'Rules Of Engagement: How We Communicate',
    url: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=5b49cbbee3f3443a9ff2a83c4ef30d7d'
  },
  { 
    id: '1.2', 
    title: 'How To Look At Your Training',
    url: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=89d09a3ef3b746afb794fa073dbcb0e0'
  },
  { 
    id: '1.3', 
    title: 'How To View And Log Your Nutrition',
    url: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=0ccf6347631645dd807355aec93e2dd0'
  },
  { 
    id: '1.4', 
    title: 'What To Expect Inside The First 30 Days',
    url: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=6ec1abffaaa945ffbd2dd6e119708f16'
  },
  { 
    id: '1.5', 
    title: 'How to Take Progress Photos',
    url: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=177714bb230d4d7ca2b4f7e7786979e1'
  },
  { 
    id: '1.6', 
    title: 'Truecoach Tutorial',
    url: 'https://www.skool.com/be-a-a-better-man-5157/classroom/f1987603?md=d382e85abc1643f49c5009d3bc767487'
  },
];


const Courses = () => {
  const handleSubCoursePress = (url: string) => {
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
              onPress={() => handleSubCoursePress(sub.url)}
            >
              <Text style={styles.subCourseText}>{sub.id} {sub.title}</Text>
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
});

export default Courses;
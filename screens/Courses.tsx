import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Linking,
  Dimensions,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Where course JSON files will live in your GitHub repo
const GITHUB_COURSES_DIR = 'https://api.github.com/repos/Enda21/betterAppPdfs/contents/Courses';

export type Course = {
  id: string;
  title: string;
  summary: string;
  videoUrl: string; // YouTube link or direct video
  externalUrl: string; // Optional deep link to Skool or elsewhere
};

// A small set of sample lessons that include text content and an embeddable video URL.
// These use YouTube embed URLs so the video can be shown inside a WebView in the app.
// You can replace videoUrl with links to hosted mp4 files or other providers later.
const LOCAL_FALLBACK: Course[] = [
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
  const [query, setQuery] = useState('');
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateCourse = (raw: any): raw is Course => {
    return (
      raw &&
      typeof raw.id === 'string' &&
      typeof raw.title === 'string' &&
      typeof raw.summary === 'string' &&
      typeof raw.videoUrl === 'string' &&
      typeof raw.externalUrl === 'string'
    );
  };

  // Load from GitHub: either manifest.json (single file) or per-file *.json
  const loadFromGithub = useCallback(async () => {
    setError(null);
    try {
      // List the Courses directory
      const res = await fetch(`${GITHUB_COURSES_DIR}?_=${Date.now()}`, {
        headers: {
          'User-Agent': 'BeBetterMan-App',
          Accept: 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const dirItems: Array<{ name: string; type: 'file' | 'dir'; download_url?: string; path: string }>= await res.json();

      // Prefer manifest.json if present (single network fetch)
      const manifest = dirItems.find((f) => f.type === 'file' && f.name.toLowerCase() === 'manifest.json');
      if (manifest?.download_url) {
        const mRes = await fetch(`${manifest.download_url}?_=${Date.now()}`);
        if (!mRes.ok) throw new Error(`Manifest fetch failed: ${mRes.status}`);
        const data = await mRes.json();
        const list: Course[] = Array.isArray(data) ? data.filter(validateCourse) : [];
        if (list.length === 0) throw new Error('Manifest empty or invalid');
        // Sort by id natural-ish
        list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
        setCourses(list);
        return;
      }

      // Else, fetch all *.json files in the folder
      const jsonFiles = dirItems.filter((f) => f.type === 'file' && /\.json$/i.test(f.name));
      const fetched = await Promise.all(
        jsonFiles.map(async (f) => {
          if (!f.download_url) return null;
          try {
            const r = await fetch(`${f.download_url}?_=${Date.now()}`);
            if (!r.ok) return null;
            const obj = await r.json();
            return validateCourse(obj) ? obj : null;
          } catch {
            return null;
          }
        })
      );
      const list = fetched.filter(Boolean) as Course[];
      if (list.length === 0) throw new Error('No valid course JSON found');
      list.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
      setCourses(list);
    } catch (e: any) {
      setError('Could not load the latest courses from GitHub. Showing offline list.');
      setCourses(LOCAL_FALLBACK);
    }
  }, []);

  useEffect(() => {
    loadFromGithub();
  }, [loadFromGithub]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadFromGithub();
    setRefreshing(false);
  }, [refreshing, loadFromGithub]);

  const filteredCourses = useMemo(() => {
    const q = (query || '').trim().toLowerCase();
    const source = courses ?? LOCAL_FALLBACK;
    if (!q) return source;
    return source.filter((s) => {
      return (
        (s.title || '').toLowerCase().includes(q) ||
        (s.summary || '').toLowerCase().includes(q) ||
        (s.id || '').toLowerCase().includes(q)
      );
    });
  }, [query, courses]);

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
        {error ? (
          <View style={styles.banner}><Text style={styles.bannerText}>{error}</Text></View>
        ) : null}
        <TextInput
          placeholder="Search lessons or summaries..."
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        <ScrollView
          style={styles.subCourseList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {!courses && !error ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#0947aa" />
              <Text style={{ marginTop: 8, color: '#555' }}>Loading courses…</Text>
            </View>
          ) : null}

          {filteredCourses.map((sub) => (
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
          {filteredCourses.length === 0 ? (
            <Text style={{color: '#666'}}>No results for "{query}"</Text>
          ) : (
            filteredCourses.map((sub) => (
              <TouchableOpacity key={`ext-${sub.id}`} onPress={() => handleOpenExternal(sub.externalUrl)}>
                <Text style={{color: '#0947aa', marginBottom: 6}}>{sub.id} - Open in browser</Text>
              </TouchableOpacity>
            ))
          )}
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
  banner: {
    backgroundColor: '#fde68a',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
    marginBottom: 10,
  },
  bannerText: { color: '#7c3e00' },
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
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    color: '#000',
  },
});

export default Courses;
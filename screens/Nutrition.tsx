import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  View,
  TextInput,
  RefreshControl,
  Platform,
  ActionSheetIOS,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { Asset } from 'expo-asset';
import { Ionicons } from '@expo/vector-icons';

type RemoteItem = {
  name: string;
  download_url: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir';
};

type MealPlan = {
  title: string;
  url: string;
  filename: string;
  size?: number;
  lastModified?: string;
  tags?: string[];
};

// 👉 Your GitHub repo (root folder)
const GITHUB_API =
  'https://api.github.com/repos/Enda21/betterAppPdfs/contents';

const localFallback: MealPlan[] = [
  { title: '1800 Meal Options (On the Go)', filename: '1800_Meal_Options_for_on_the_go.pdf', url: '' },
  { title: 'High Protein Snack Ideas', filename: 'High_protein_snack_ideas.pdf', url: '' },
  { title: 'Snacks on the Go', filename: 'snacks_on_the_go.pdf', url: '' },
  { title: 'The BABM Travel Bible', filename: 'The_BABM_Travel_Bible.pdf', url: '' },
  { title: 'Evening Snacking: The Silent Saboteur', filename: 'Evening_Snacking_The_Silent_Saboteur.pdf', url: '' },
];

// Map local asset requires (used only if remote listing fails)
const localAssets: Record<string, any> = {
  '1800_Meal_Options_for_on_the_go.pdf': require('../assets/1800_Meal_Options_for_on_the_go.pdf'),
  'High_protein_snack_ideas.pdf': require('../assets/High_protein_snack_ideas.pdf'),
  'snacks_on_the_go.pdf': require('../assets/snacks_on_the_go.pdf'),
  'The_BABM_Travel_Bible.pdf': require('../assets/The_BABM_Travel_Bible.pdf'),
  'Evening_Snacking_The_Silent_Saboteur.pdf': require('../assets/Evening_Snacking_The_Silent_Saboteur.pdf'),
};

function titleFromFilename(filename: string) {
  const name = filename.replace(/\.pdf$/i, '');
  const spaced = name.replace(/[_-]+/g, ' ');
  return spaced
    .replace(/\b(babm)\b/gi, 'BABM')
    .replace(/\s+/g, ' ')
    .trim();
}

const isHttpUrl = (u?: string) => !!u && /^https?:\/\//i.test(u);

const Nutrition = () => {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<MealPlan[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRemote = useCallback(async () => {
    setError(null);
    try {
      // cache-bust to force latest listing
      const res = await fetch(`${GITHUB_API}?_=${Date.now()}`, {
        headers: {
          'User-Agent': 'BeBetterMan-App',
          Accept: 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data: RemoteItem[] = await res.json();

      const pdfs = data
        .filter((f) => f.type === 'file' && /\.pdf$/i.test(f.name))
        .map<MealPlan>((f) => ({
          title: titleFromFilename(f.name),
          url: f.download_url,
          filename: f.name,
          size: f.size,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

      setItems(pdfs);
    } catch (e: any) {
      setError('Could not load latest meal plans online. Showing offline bundle instead.');
      // populate local asset URLs
      const populated = await Promise.all(
        localFallback.map(async (mp) => {
          const assetModule = localAssets[mp.filename];
          if (!assetModule) return mp;
          const asset = Asset.fromModule(assetModule);
          await asset.downloadAsync();
          return { ...mp, url: asset.localUri ?? '' };
        })
      );
      setItems(populated);
    }
  }, []);

  useEffect(() => {
    loadRemote();
  }, [loadRemote]);

  const onRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    await loadRemote();
    setRefreshing(false);
  }, [refreshing, loadRemote]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => {
      const hay = `${i.title} ${i.filename} ${(i.tags || []).join(' ')}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const openInBrowser = async (url: string) => {
    if (!url) return Alert.alert('Error', 'File URL not available.');
    try {
      if (isHttpUrl(url)) {
        await WebBrowser.openBrowserAsync(url);
      } else {
        await Sharing.shareAsync(url);
      }
    } catch {
      Alert.alert('Error', 'Could not open the PDF.');
    }
  };

  const downloadAndShare = async (item: MealPlan) => {
    try {
      if (!item.url) throw new Error('Missing file URL');
  const dest = (FileSystem as any).documentDirectory + item.filename;

      const info = await FileSystem.getInfoAsync(dest);
      if (!info.exists) {
        if (isHttpUrl(item.url)) {
          const { uri } = await FileSystem.downloadAsync(item.url, dest);
          if (!uri) throw new Error('Download returned empty URI');
        } else {
          await FileSystem.copyAsync({ from: item.url, to: dest });
        }
      }
      await Sharing.shareAsync(dest);
    } catch (e: any) {
      Alert.alert('Download/Share Error', e?.message ?? 'Could not download or share this PDF.');
    }
  };

  const promptOpenOrDownload = (item: MealPlan) => {
    const doOpen = () => openInBrowser(item.url);
    const doDownload = () => downloadAndShare(item);

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: item.title,
          options: ['Open', 'Download & Share', 'Cancel'],
          cancelButtonIndex: 2,
        },
        (idx) => {
          if (idx === 0) doOpen();
          else if (idx === 1) doDownload();
        }
      );
    } else {
      Alert.alert(item.title, undefined, [
        { text: 'Open', onPress: doOpen },
        { text: 'Download & Share', onPress: doDownload },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.headerRow}>
        <Text style={styles.header}>Meal Plans</Text>
        <TouchableOpacity
          onPress={onRefresh}
          disabled={refreshing}
          style={[styles.refreshBtn, refreshing && styles.refreshBtnDisabled]}
          accessibilityLabel="Refresh meal plans"
        >
          {refreshing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Ionicons name="refresh" size={18} color="#ffffff" />
          )}
          <Text style={styles.refreshText}>{refreshing ? 'Refreshing' : 'Refresh'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search meal plans..."
        placeholderTextColor="#94a3b8"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        autoCorrect={false}
        autoCapitalize="none"
      />

      {error ? (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      ) : null}

      {filtered.map((item, idx) => (
        <TouchableOpacity
          key={`${item.filename}-${idx}`}
          style={styles.card}
          onPress={() => promptOpenOrDownload(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSub}>
            {item.filename.replace(/\.pdf$/i, '').slice(0, 80)}
          </Text>
          <Text style={styles.cardHint}>Tap to Open or Download</Text>
        </TouchableOpacity>
      ))}

      {filtered.length === 0 && (
        <Text style={styles.empty}>No meal plans match “{query}”.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F1EFE7' },

  headerRow: {
    paddingTop: 60,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: { fontSize: 24, fontWeight: '700' },

  refreshBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  refreshBtnDisabled: {
    opacity: 0.7,
  },
  refreshText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },

  search: {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  banner: {
    backgroundColor: '#fde68a',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  bannerText: { color: '#7c3e00' },

  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderLeftColor: '#0e0bbeff',
    borderLeftWidth: 4,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  cardSub: { fontSize: 12, color: '#cbd5e1' },
  cardHint: { marginTop: 10, fontSize: 12, color: '#93c5fd' },
  empty: { color: '#0f172a', opacity: 0.7, paddingVertical: 20 },
});

export default Nutrition;

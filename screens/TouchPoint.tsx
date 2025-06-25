
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';

interface TouchPointCategory {
  id: string;
  title: string;
  description: string;
  rating: number;
}

const TouchPoint = () => {
  const [categories, setCategories] = useState<TouchPointCategory[]>([
    {
      id: 'nutrition',
      title: 'Nutrition',
      description: 'quality, snacking, eating times, planning ahead',
      rating: 0,
    },
    {
      id: 'recovery',
      title: 'Recovery',
      description: 'sleep, stretching, cold water, down time',
      rating: 0,
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle',
      description: 'walking, hydration, sunlight, positive energy',
      rating: 0,
    },
    {
      id: 'training',
      title: 'Training',
      description: 'consistency, intensity',
      rating: 0,
    },
    {
      id: 'accountability',
      title: 'Accountability',
      description: 'weekly review, whatsapp, Skool, podcast',
      rating: 0,
    },
  ]);

  const updateRating = (categoryId: string, rating: number) => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, rating } : cat
      )
    );
  };

  const getTotalPercentage = () => {
    const totalRating = categories.reduce((sum, cat) => sum + cat.rating, 0);
    const maxPossible = categories.length * 10;
    return Math.round((totalRating / maxPossible) * 100);
  };

  const allCategoriesRated = () => {
    return categories.every(cat => cat.rating > 0);
  };

  const handleSubmit = () => {
    if (!allCategoriesRated()) {
      Alert.alert('Incomplete Assessment', 'Please rate all categories before submitting.');
      return;
    }

    const percentage = getTotalPercentage();
    Alert.alert(
      'Assessment Complete',
      `Your overall score is ${percentage}%. Great work on completing your touch point assessment!`,
      [{ text: 'OK' }]
    );
  };

  const renderRatingButtons = (categoryId: string, currentRating: number) => {
    return (
      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
          <TouchableOpacity
            key={rating}
            style={[
              styles.ratingButton,
              currentRating === rating && styles.selectedRating,
            ]}
            onPress={() => updateRating(categoryId, rating)}
          >
            <Text
              style={[
                styles.ratingText,
                currentRating === rating && styles.selectedRatingText,
              ]}
            >
              {rating}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Touch Point: What % are we currently at?</Text>
        <Text style={styles.headerSubtitle}>Rate the following /10</Text>
        
        {allCategoriesRated() && (
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreText}>Current Score: {getTotalPercentage()}%</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryTitle}>{category.title}:</Text>
              <Text style={styles.categoryDescription}>{category.description}</Text>
            </View>
            
            {renderRatingButtons(category.id, category.rating)}
            
            {category.rating > 0 && (
              <View style={styles.selectedRatingDisplay}>
                <Text style={styles.selectedRatingDisplayText}>
                  Rating: {category.rating}/10
                </Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.submitButton,
            !allCategoriesRated() && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!allCategoriesRated()}
        >
          <Text style={styles.submitButtonText}>Complete Assessment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0A1628',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  scoreContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#4B3BE7',
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  categoryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  categoryHeader: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F59E0B',
    marginBottom: 8,
  },
  categoryDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  ratingButton: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  selectedRating: {
    backgroundColor: '#4B3BE7',
    borderColor: '#4B3BE7',
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedRatingText: {
    color: '#FFFFFF',
  },
  selectedRatingDisplay: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#4B3BE7',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  selectedRatingDisplayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default TouchPoint;

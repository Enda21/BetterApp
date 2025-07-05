import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';

const PdfViewer = ({ route }: any) => {
  const { uri } = route.params;

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri }}
        style={styles.pdf}
        onError={(error) => {
          console.error('PDF load error:', error);
        }}
      />
    </View>
  );
};

export default PdfViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1628',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

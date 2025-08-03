import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AppHeaderProps {
  subtitle?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ subtitle }) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <Ionicons name="car" size={28} color="#fff" style={styles.icon} />
        <Text style={styles.title}>cuzcatlansv.ride</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#2563EB',
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  icon: {
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    color: '#fff',
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },
});

export default AppHeader; 
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

type EventItem = {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string | null;
  eventUrl: string;
  imageUrl?: string | null;
  startsAt: string;
  venueName?: string | null;
  city?: string | null;
  region?: string | null;
  isOnline: boolean;
  sourceType: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function App() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [city, setCity] = useState('Montreal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}/api/events?city=${encodeURIComponent(city)}&limit=50`;
      const response = await fetch(url);
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || 'Failed to load events');
      setEvents(json.events);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadEvents(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Spiritual Events</Text>
        <Text style={styles.subtitle}>Kirtan, Gita, meditation, yoga, and bhakti events near you.</Text>
        <View style={styles.searchRow}>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" />
          <TouchableOpacity style={styles.button} onPress={loadEvents}><Text style={styles.buttonText}>Search</Text></TouchableOpacity>
        </View>
        {loading && <ActivityIndicator />}
        {error && <Text style={styles.error}>{error}</Text>}
        {events.map((event) => (
          <View key={event.id} style={styles.card}>
            {event.imageUrl ? <Image source={{ uri: event.imageUrl }} style={styles.image} /> : <View style={styles.placeholder}><Text>ॐ</Text></View>}
            <View style={styles.cardBody}>
              <Text style={styles.badge}>{event.sourceType}</Text>
              <Text style={styles.cardTitle}>{event.title}</Text>
              <Text style={styles.meta}>{new Date(event.startsAt).toLocaleString()}</Text>
              <Text style={styles.meta}>{event.isOnline ? 'Online' : [event.venueName, event.city, event.region].filter(Boolean).join(' · ')}</Text>
              {event.shortDescription ? <Text style={styles.description}>{event.shortDescription}</Text> : null}
              <TouchableOpacity style={styles.outlineButton} onPress={() => Linking.openURL(event.eventUrl)}>
                <Text style={styles.outlineText}>View / RSVP on source</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fffaf0' },
  container: { padding: 20, gap: 16 },
  title: { fontSize: 38, fontWeight: '900', color: '#20150b' },
  subtitle: { fontSize: 16, color: '#6b5b4b', lineHeight: 24 },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eadfcf', padding: 12, borderRadius: 12 },
  button: { backgroundColor: '#b45309', paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  buttonText: { color: '#fff', fontWeight: '800' },
  error: { color: '#991b1b' },
  card: { backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#eadfcf', overflow: 'hidden' },
  image: { width: '100%', height: 180 },
  placeholder: { height: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffedd5' },
  cardBody: { padding: 16, gap: 8 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#ffedd5', color: '#9a3412', fontWeight: '800', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, overflow: 'hidden' },
  cardTitle: { fontSize: 20, fontWeight: '900', color: '#20150b' },
  meta: { color: '#6b5b4b' },
  description: { color: '#6b5b4b', lineHeight: 22 },
  outlineButton: { borderWidth: 1, borderColor: '#fed7aa', padding: 12, borderRadius: 12, marginTop: 8 },
  outlineText: { color: '#9a3412', fontWeight: '800', textAlign: 'center' }
});

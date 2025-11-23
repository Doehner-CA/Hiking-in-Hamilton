import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useState } from 'react';
import trailsGeoJson from './Trails40.geojson';

// Hamilton, ON coordinates
const HAMILTON_REGION = {
  latitude: 43.2557,
  longitude: -79.8711,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

// extract trail info with coordinates
const parseTrailsData = (geojson) => {
  return geojson.features.map((feature, index) => {
    // Get first coordinate of the LineString as marker position
    const coords = feature.geometry.coordinates[0];

    return {
      id: feature.properties.OBJECTID || index,
      name: feature.properties.TRAIL_NAME || `Trail ${feature.properties.OBJECTID || index}`,
      type: feature.properties.TRAIL_TYPE || 'Unknown',
      surface: feature.properties.SURFACE || 'Unknown',
      length: feature.properties.LENGTH_IN_METRES
        ? `${Math.round(feature.properties.LENGTH_IN_METRES)}m`
        : 'Unknown',
      latitude: coords[1], 
      longitude: coords[0],
      bruceTrail: feature.properties.BRUCE_TRAIL === 'Yes',
      transCanadaTrail: feature.properties.TRANSCANADA_TRAIL === 'Yes',
    };
  });
};

const ALL_TRAILS = parseTrailsData(trailsGeoJson);

export default function App() {
  const [mapType, setMapType] = useState('standard');
  const [showAllTrails, setShowAllTrails] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hiking in Hamilton</Text>
        <Text style={styles.headerSubtitle}>Discover trails in Hamilton, Ontario</Text>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={HAMILTON_REGION}
        mapType={mapType}
      />

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Trail View Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>All Trails</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>My Favourites</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.locationButton]}>
            <Text style={styles.buttonText}>My Location</Text>
          </TouchableOpacity>
        </View>

        {/* Map Type Toggle */}
        <View style={styles.mapTypeRow}>
          <Text style={styles.mapTypeLabel}>Map Type:</Text>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'standard' && styles.mapTypeActive]}
            onPress={() => setMapType('standard')}
          >
            <Text style={[styles.mapTypeText, mapType === 'standard' && styles.mapTypeTextActive]}>
              Standard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mapTypeButton, mapType === 'satellite' && styles.mapTypeActive]}
            onPress={() => setMapType('satellite')}
          >
            <Text style={[styles.mapTypeText, mapType === 'satellite' && styles.mapTypeTextActive]}>
              Satellite
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#2E7D32',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#C8E6C9',
    marginTop: 4,
  },
  map: {
    flex: 1,
  },
  controls: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  locationButton: {
    backgroundColor: '#1976D2',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  mapTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapTypeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  mapTypeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 4,
  },
  mapTypeActive: {
    backgroundColor: '#2E7D32',
  },
  mapTypeText: {
    fontSize: 12,
    color: '#666',
  },
  mapTypeTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});

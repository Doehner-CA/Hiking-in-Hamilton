//StAuth10244: I Xiaodong Cao, 000911762 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { useState, useRef } from 'react';
import * as Location from 'expo-location';
import trailsGeoJson from './Trails.json';

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
// 10 Default Favourite Trails
const DEFAULT_FAVOURITES = [
  {
    id: 'fav-1',
    name: "Tyneside Trail",
    type: "Lake, Free",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.11109914283806,
    longitude: -79.8732420895561,
    description: "This is a pleasant and flat path along the water that is great for walking or biking.",
    isFavourite: true,
  },
  {
    id: 'fav-2',
    name: "Escarpment Rail Trail",
    type: "Rail, Free",
    surface: "Paved",
    length: "Unknown",
    latitude: 43.20139327773242,
    longitude: -79.82158648714557,
    description: "Fully-paved trail along the Niagara Escarpment with amazing views.",
    isFavourite: true,
  },
  {
    id: 'fav-3',
    name: "Chedoke Radial Trail",
    type: "Waterfalls, Free",
    surface: "Multi-use",
    length: "Unknown",
    latitude: 43.24669915297982,
    longitude: -79.91195056027088,
    description: "One of Hamilton's best multi-use trails with amazing vistas.",
    isFavourite: true,
  },
  {
    id: 'fav-4',
    name: "McMaster Forest",
    type: "Forest, Free",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.24506557927751,
    longitude: -79.95257648333889,
    description: "Fantastic loop through thick forest and meadows with interpretive signs.",
    isFavourite: true,
  },
  {
    id: 'fav-5',
    name: "Sherman and Tiffany Waterfalls via Bruce Trail",
    type: "Waterfalls",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.238953221811286,
    longitude: -79.95791859629828,
    description: "Visit Tiffany Falls and Sherman Falls along the Bruce Trail.",
    isFavourite: true,
  },
  {
    id: 'fav-6',
    name: "King's Forest - Albion Falls - Buttermilk Falls - Bruce Trail",
    type: "Waterfalls, Forest",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.21791946306637,
    longitude: -79.805003850925,
    description: "A highlight reel of Hamilton's Red Hill Valley and Niagara Escarpment.",
    isFavourite: true,
  },
  {
    id: 'fav-7',
    name: "Mountain Brow via King's Forest",
    type: "Forest, Waterfalls, Free",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.22697425681391,
    longitude: -79.81621492309858,
    description: "Bruce Trail through King's Forest old growth lands.",
    isFavourite: true,
  },
  {
    id: 'fav-8',
    name: "Felker's Falls and Bruce Trail: Mountain Brow Side Trail",
    type: "Waterfalls, Free",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.20318548683469,
    longitude: -79.79177440489535,
    description: "Four large waterfalls, lookouts, and beautiful rock formations.",
    isFavourite: true,
  },
  {
    id: 'fav-9',
    name: "Dundas Valley Trail",
    type: "Forest",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.24574586466557,
    longitude: -79.99598627420694,
    description: "Beautiful forest trail in Dundas Valley.",
    isFavourite: true,
  },
  {
    id: 'fav-10',
    name: "White Tailed Deer Trail",
    type: "Lake, Forest",
    surface: "Natural",
    length: "Unknown",
    latitude: 43.27860451277102,
    longitude: -80.03917635092544,
    description: "Loop around Spencer Creek and Christie Lake.",
    isFavourite: true,
  },
];

export default function App() {

  const [mapType, setMapType] = useState('standard');
  const [favouriteTrails, setFavouriteTrails] = useState(DEFAULT_FAVOURITES);
  const [activeView, setActiveView] = useState(null); // 'all', 'favourites', or null
  const [userLocation, setUserLocation] = useState(null); // { latitude, longitude }

  const mapRef = useRef(null);

  const isTrailFavourite = (trailId) => {
    return favouriteTrails.some(fav => fav.id === trailId);
  };

  const addToFavourites = (trail) => {
    if (!isTrailFavourite(trail.id)) {
      setFavouriteTrails([...favouriteTrails, { ...trail, isFavourite: true }]);
    }
  };

  const removeFromFavourites = (trailId) => {
    setFavouriteTrails(favouriteTrails.filter(fav => fav.id !== trailId));
  };

  const handleAllTrailsPress = () => {
    setActiveView(activeView === 'all' ? null : 'all');
  };

  const handleFavouritesPress = () => {
    setActiveView(activeView === 'favourites' ? null : 'favourites');
  };

  // Render user location marker
  const renderUserLocationMarker = () => {
    if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
      return null;
    }

    return (
      <Marker
        key={`user-location-${userLocation.latitude}-${userLocation.longitude}`}
        coordinate={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        }}
        pinColor="#1976D2"
        title="You are here"
        tracksViewChanges={false}
      >
        <Callout>
          <View style={styles.calloutContent}>
            <Text style={styles.calloutTitle}>📍 Your Location</Text>
            <Text style={styles.calloutDetail}>
              Latitude: {userLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.calloutDetail}>
              Longitude: {userLocation.longitude.toFixed(6)}
            </Text>
            <Text style={[styles.calloutDescription, { marginTop: 8 }]}>
              This is your current GPS location.
            </Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  // Get user's current location
  const handleMyLocationPress = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your current location on the map.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);

      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: userCoords.latitude,
          longitude: userCoords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }, 1000); 
      }

      Alert.alert(
        'Location Found',
        `Your location has been added to the map!\nLat: ${userCoords.latitude.toFixed(6)}\nLng: ${userCoords.longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Error',
        'Unable to get your location. Please make sure location services are enabled.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hiking in Hamilton</Text>
        <Text style={styles.headerSubtitle}>Discover trails in Hamilton, Ontario</Text>
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={HAMILTON_REGION}
        mapType={mapType}
      >
        {/* ALL TRAILS VIEW */}
        {activeView === 'all' && (
          <>
            {ALL_TRAILS.map((trail) => {
              const isFav = isTrailFavourite(trail.id);
              return (
                <Marker
                  key={trail.id}
                  coordinate={{
                    latitude: trail.latitude,
                    longitude: trail.longitude,
                  }}
                  pinColor={isFav ? "#FF5722" : "#4CAF50"}
                  onCalloutPress={() => {
                    if (isFav) {
                      removeFromFavourites(trail.id);
                    } else {
                      addToFavourites(trail);
                    }
                  }}
                >
                  <Callout>
                    <View style={styles.calloutContent}>
                      <Text style={styles.calloutTitle}>{trail.name}</Text>
                      <Text style={styles.calloutDetail}>Type: {trail.type}</Text>
                      <Text style={styles.calloutDetail}>Surface: {trail.surface}</Text>
                      <Text style={styles.calloutDetail}>Length: {trail.length}</Text>
                      {trail.bruceTrail && (
                        <Text style={styles.calloutBadge}>Bruce Trail</Text>
                      )}
                      {trail.transCanadaTrail && (
                        <Text style={styles.calloutBadge}>Trans-Canada Trail</Text>
                      )}
                      <View style={styles.calloutAction}>
                        <Text style={styles.calloutActionText}>
                          {isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                        </Text>
                      </View>
                    </View>
                  </Callout>
                </Marker>
              );
            })}

            {favouriteTrails.filter(fav =>//only return favourites trails that are not in ALL_Trails to aviod  duplication
              !ALL_TRAILS.some(trail => trail.id === fav.id)
            ).map((trail) => (
              <Marker
                key={trail.id}
                coordinate={{
                  latitude: trail.latitude,
                  longitude: trail.longitude,
                }}
                pinColor="#FF5722"
                onCalloutPress={() => removeFromFavourites(trail.id)}
              >
                <Callout>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>{trail.name}</Text>
                    <Text style={styles.calloutDetail}>Type: {trail.type}</Text>
                    <Text style={styles.calloutDetail}>Surface: {trail.surface}</Text>
                    <Text style={styles.calloutDetail}>Length: {trail.length}</Text>
                    {trail.description && (
                      <Text style={styles.calloutDescription}>{trail.description}</Text>
                    )}
                    <View style={styles.calloutAction}>
                      <Text style={styles.calloutActionText}>Remove from Favourites</Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
            {renderUserLocationMarker()}
          </>
        )}

        {/* FAVOURITES VIEW */}
        {activeView === 'favourites' && (
          <>
            {favouriteTrails.map((trail) => (
              <Marker
                key={trail.id}
                coordinate={{
                  latitude: trail.latitude,
                  longitude: trail.longitude,
                }}
                pinColor="#FF5722"
                onCalloutPress={() => removeFromFavourites(trail.id)}
              >
                <Callout>
                  <View style={styles.calloutContent}>
                    <Text style={styles.calloutTitle}>{trail.name}</Text>
                    <Text style={styles.calloutDetail}>Type: {trail.type}</Text>
                    <Text style={styles.calloutDetail}>Surface: {trail.surface}</Text>
                    <Text style={styles.calloutDetail}>Length: {trail.length}</Text>
                    {trail.description && (
                      <Text style={styles.calloutDescription}>{trail.description}</Text>
                    )}
                    <View style={styles.calloutAction}>
                      <Text style={styles.calloutActionText}>Remove from Favourites</Text>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
            {renderUserLocationMarker()}
          </>
        )}

        {/* only display userLocation marker */}
        {!activeView && renderUserLocationMarker()}
      </MapView>

      {/* Control Buttons */}
      <View style={styles.controls}>
        {/* Trail View Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, activeView === 'all' && styles.buttonActive]}
            onPress={handleAllTrailsPress}
          >
            <Text style={styles.buttonText}>
              {activeView === 'all' ? 'Hide Trails' : 'All Trails'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, activeView === 'favourites' && styles.buttonActive]}
            onPress={handleFavouritesPress}
          >
            <Text style={styles.buttonText}>
              {activeView === 'favourites' ? 'Hide Favourites' : 'My Favourites'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.locationButton]}
            onPress={handleMyLocationPress}
          >
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,  // For Android
  },
  buttonActive: {
    backgroundColor: '#2E7D32',
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
  callout: {
    width: 200,
  },
  calloutContent: {
    padding: 10,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 6,
  },
  calloutDetail: {
    fontSize: 13,
    color: '#333',
    marginBottom: 3,
  },
  calloutBadge: {
    fontSize: 11,
    color: '#fff',
    backgroundColor: '#1976D2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 18,
  },
  calloutAction: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  calloutActionText: {
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  favouriteButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 10,
    alignItems: 'center',
  },
  removeFavouriteButton: {
    backgroundColor: '#FF5722',
  },
  favouriteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

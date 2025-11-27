# Hiking in Hamilton

A React Native mobile application for discovering and navigating hiking trails in Hamilton, Ontario.

## Features

- **All Trails**: View 80+ trails from Hamilton's trail database with detailed information
- **My Favourites**: Save and manage your favorite trails (includes 10 curated defaults)
- **My Location**: Find your current GPS location on the map
- **Map Type Toggle**: Switch between Standard and Satellite map views
- **Trail Details**: View trail name, type, surface, length, and special badges (Bruce Trail, Trans-Canada Trail)

## Technology Stack

- React Native 0.81.5
- Expo SDK 54
- react-native-maps 1.20.1
- expo-location 19.0.7

## Installation

```bash
npm install
```

## Running the App

```bash
npm start
```

Scan the QR code with the Expo Go app on your mobile device.

## Usage

1. **All Trails**: Tap to display all available trails on the map
2. **My Favourites**: Tap to view only your favorite trails
3. **My Location**: Tap to center the map on your current location
4. **Map Type**: Toggle between Standard and Satellite views
5. **Add/Remove Favourites**: Tap a trail marker, then tap the callout to manage favorites

## Project Structure

```
HikinginHamilton/
├── App.js          # Main application component
├── Trails.json     # Trail data from Hamilton (GeoJSON)
├── app.json        # Expo configuration
└── package.json    # Dependencies
```

## Permissions

The app requires location permissions to show your current position on the map.

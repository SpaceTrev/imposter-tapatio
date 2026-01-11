import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme];

  return (
    <>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="play"
          options={{
            title: 'Jugar',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="wifi"
          options={{
            title: 'WiFi Local',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoommateSplash from '../screens/splashScreen';
import Tabnavigation from './tabnavigation';

const Stack = createNativeStackNavigator();

export default function MainNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoommateSplash"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="RoommateSplash">
          {({ navigation }) => (
            <RoommateSplash
              onFinish={() => navigation.replace('TabNavigation')}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="TabNavigation"
          component={Tabnavigation}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
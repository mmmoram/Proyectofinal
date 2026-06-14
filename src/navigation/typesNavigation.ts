import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Detail: { idMeal: string };
  Favorites: undefined;
  Profile: undefined;
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

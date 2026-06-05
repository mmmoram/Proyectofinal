import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Form: undefined;
  List: undefined;
  Stats: undefined;
  Detail: { petId: number };
  Profile: undefined;
  Shelters: { city: string };
};

export type NavigationProps = NativeStackNavigationProp<RootStackParamList>;
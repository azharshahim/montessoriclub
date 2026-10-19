// Point d'entrée natif. L'import gesture-handler doit rester le premier import.
import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);

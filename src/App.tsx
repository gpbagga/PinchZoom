import {useState, useEffect} from 'react'
import { View, Text } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
// import FullScreenImage from './FullScreenImage'
import FullScreenImage from '../FullScreenImageTemp'
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FullScreenImage/>
    </GestureHandlerRootView>
  )
}

export default App
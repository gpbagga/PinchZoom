import React, {useRef, useState} from 'react'
import { View, Image, useWindowDimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
// PanResponder is implemented in javascript so we can't use it for animation which 
// directly runs on native thread which is in the case of react native reanimated API

///////////IMPORTANT//////////////
  //NOTE:- here pinchGestureHandler is applied to the animated view 
  //component not on animated.Image component which is being transformed because:
  //nested animated.image is being transformed so every time handler gives focal point
  //according to new state of that view that is why we attached the handler to 
  // animated view component which is not being transformed so that handler gives 
  //focalpoint according to initial state of nested animated.Image.
const FullScreenImage = () => {
  
  const window = useWindowDimensions()

  const translate = useSharedValue({x: 0, y: 0})
  
  const offsetScale = useSharedValue(1)
  
  const afterPinchTrans = useSharedValue({x: 0, y: 0})

  // consider adjustedFocal is a vector from center of image to focal point of touches
  const adjustedFocal = useSharedValue({x: 0, y: 0})

  const pinchScale = useSharedValue(1)

  const panFlag = useSharedValue(false)

  const transTemp = useSharedValue({x: 0, y: 0})

  const prevTranslation = useSharedValue({x: 0, y: 0})

  const prevAdjustedFocal = useSharedValue({x: 0, y: 0})
  const t1 = useSharedValue({x: 0, y: 0})
  const t2 = useSharedValue({x: 0, y: 0})
  const temp = useSharedValue(false)
  console.log("rendering component")
  //NOTE onEnd callback is fired for pinch gesture first before the pan gesture's

  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate((event)=> {
      if(panFlag.value){
        translate.value = {
          x: event.translationX + prevTranslation.value.x, 
          y: event.translationY + prevTranslation.value.y
        }
      }

    })
    .onEnd(()=> {
      prevTranslation.value = {
        x: translate.value.x,
        y: translate.value.y
      }

    })

  const pinchGesture = Gesture.Pinch()
    .onStart((event)=> {
      panFlag.value = true

      prevTranslation.value = {
        x: translate.value.x + (event.focalX - (prevAdjustedFocal.value.x + window.width/2 + translate.value.x))* (1 - 1/offsetScale.value),
        y: translate.value.y + (event.focalY - (prevAdjustedFocal.value.y + window.height/2 + translate.value.y))* (1 - 1/offsetScale.value)
      }
      translate.value = {...prevTranslation.value}
    })
    .onUpdate((event)=> {
      adjustedFocal.value = {
        x: (event.focalX - (window.width/2 + translate.value.x)),
        y: (event.focalY - (window.height/2 + translate.value.y)),
      }

      pinchScale.value = event.scale * offsetScale.value

    })
    .onEnd(()=> {
      offsetScale.value = pinchScale.value
      prevAdjustedFocal.value = {...adjustedFocal.value}
      if(offsetScale.value <= 1){
        translate.value = {x: 0, y: 0}
        offsetScale.value = 1;
        pinchScale.value = 1
        panFlag.value = false
      }
      // prevAdjustedFocal.value = {
      //   ...adjustedFocal.value
      // }
      // if(offsetScale.value <= 1){
      //   panFlag.value= false
      //   afterPinchTrans.value = {x: 0, y: 0}
      //   pinchScale.value = 1
      //   offsetScale.value = 1
      // }else{
      //   afterPinchTrans.value = {
      //     x:afterPinchTrans.value.x/pinchScale.value - (adjustedFocal.value.x - adjustedFocal.value.x/pinchScale.value),
      //     y:afterPinchTrans.value.y/pinchScale.value - (adjustedFocal.value.y - adjustedFocal.value.y/pinchScale.value)   
      //   }
      //   pinchScale.value = 1
      // }
    })

  const composed = Gesture.Simultaneous(
    panGesture,
    pinchGesture
  )
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: 
        [
          
          {translateX : translate.value.x},
          {translateY: translate.value.y},

          {translateX: adjustedFocal.value.x },
          {translateY: adjustedFocal.value.y },
          
          {scale: pinchScale.value},
          
          {translateX: -1 * adjustedFocal.value.x},
          {translateY: -1 * adjustedFocal.value.y},

        ]
    }
  })
  return (
    <GestureDetector gesture={composed}>
    <Animated.View
      style = {[
        {flex: 1}]}
      >
        <Animated.Image
        source = {{uri: "https://picsum.photos/id/237/500/600"}}
        style = {[
          animatedStyles,
        {
          resizeMode:"contain",
          flex: 1,
          // ...animatedStyles,
        }]}
        />

    </Animated.View>
    </GestureDetector>
  )
}

export default FullScreenImage
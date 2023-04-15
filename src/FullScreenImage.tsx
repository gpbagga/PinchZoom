import React from 'react';
import {useWindowDimensions} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import Image1 from './src/image1.jpg';

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
  const window = useWindowDimensions();
  const translate = useSharedValue({x: 0, y: 0});
  const offsetScale = useSharedValue(1);
  // consider adjustedFocal is a vector from center of image to focal point of touches
  const adjustedFocal = useSharedValue({x: 0, y: 0});
  const pinchScale = useSharedValue(1);
  const panFlag = useSharedValue(false);
  const prevTranslation = useSharedValue({x: 0, y: 0});
  const prevFocal = useSharedValue({x: 0, y: 0});
  const t1 = useSharedValue({x: 0, y: 0});
  const pinchFlag = useSharedValue(false);
  const translateDueToFocalChange = useSharedValue({x: 0, y: 0});
  
  //NOTE onEnd callback is fired for pinch gesture first before the pan gesture's
  const panGesture = Gesture.Pan()
    .averageTouches(true)
    .onUpdate(event => {
      if (!panFlag.value) return;
      // we are using one pointer for pan gesture because minor translation by focal point in pinch gesture
      // doesn't get caught by pan gesture. So we gave control of translation in focal value to pinch gesture
      if (event.numberOfPointers === 1 || !pinchFlag.value) {
        translate.value = {
          x: event.translationX - t1.value.x + prevTranslation.value.x,
          y: event.translationY - t1.value.y + prevTranslation.value.y,
        };
      } else {
        t1.value = {x: event.translationX, y: event.translationY};
      }
    })
    .onEnd(event => {
      if (event.numberOfPointers == 1) {
        prevTranslation.value = {
          x: translate.value.x,
          y: translate.value.y,
        };
      }
      t1.value = {x: 0, y: 0};
    });

  const pinchGesture = Gesture.Pinch()
    .onStart(event => {
      pinchFlag.value = true;
      translateDueToFocalChange.value = {
        x:
          (event.focalX -
            (window.width / 2 + translate.value.x + adjustedFocal.value.x)) *
          (1 - 1 / offsetScale.value),
        y:
          (event.focalY -
            (window.height / 2 + translate.value.y + adjustedFocal.value.y)) *
          (1 - 1 / offsetScale.value),
      };
      prevTranslation.value = {
        x: prevTranslation.value.x + translateDueToFocalChange.value.x,
        y: prevTranslation.value.y + translateDueToFocalChange.value.y,
      };
      translate.value = {
        x: translate.value.x + translateDueToFocalChange.value.x,
        y: translate.value.y + translateDueToFocalChange.value.y,
      };
      adjustedFocal.value = {
        x: event.focalX - (window.width / 2 + translate.value.x),
        y: event.focalY - (window.height / 2 + translate.value.y),
      };

      prevFocal.value = {x: event.focalX, y: event.focalY};
      panFlag.value = true;
    })
    .onUpdate(event => {
      translate.value = {
        x: event.focalX - prevFocal.value.x + translate.value.x,
        y: event.focalY - prevFocal.value.y + translate.value.y,
      };
      prevTranslation.value = {x: translate.value.x, y: translate.value.y};

      adjustedFocal.value = {
        x: event.focalX - (window.width / 2 + translate.value.x),
        y: event.focalY - (window.height / 2 + translate.value.y),
      };

      prevFocal.value = {x: event.focalX, y: event.focalY};

      pinchScale.value = event.scale * offsetScale.value;
    })
    .onEnd(event => {
      pinchFlag.value = false;
      offsetScale.value = pinchScale.value;

      if (offsetScale.value <= 1) {
        translate.value = {x: 0, y: 0};
        offsetScale.value = 1;
        pinchScale.value = 1;
        panFlag.value = false;
      }
    });

  const composed = Gesture.Simultaneous(pinchGesture, panGesture);
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {translateX: translate.value.x},
        {translateY: translate.value.y},

        {translateX: adjustedFocal.value.x},
        {translateY: adjustedFocal.value.y},

        {scale: pinchScale.value},

        {translateX: -1 * adjustedFocal.value.x},
        {translateY: -1 * adjustedFocal.value.y},
      ],
    };
  });
  return (
    <GestureDetector gesture={composed}>
      <Animated.View style={{flex: 1}}>
        <Animated.Image
          source={Image1}
          style={[
            {
              resizeMode: 'contain',
              width: '100%',
              height: '100%',
              // ...animatedStyles,
            },
            animatedStyles,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
};

export default FullScreenImage;

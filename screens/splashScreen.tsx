/**
 * RoommateSplash.tsx — exactly 10 second brand-story splash screen
 * React Native CLI (bare) + TypeScript
 *
 * Install:
 *   npm i react-native-reanimated@3 react-native-svg
 *   cd ios && pod install && cd ..
 *
 * babel.config.js  (reanimated plugin must be LAST):
 *   module.exports = {
 *     presets: ['module:@react-native/babel-preset'],
 *     plugins: ['react-native-reanimated/plugin'],
 *   };
 *
 * Then: npx react-native start --reset-cache   and rebuild the app.
 */
import React, { useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import Svg, {
  Path,
  Circle,
  Ellipse,
  Rect,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';

// ───────── Logo (change this path to where your logo file is) ─────────
// This file is in e.g. src/screens/ → logo in src/assets/roommate-logo.png
const LOGO = require('../assets/images/logorm.png');

// ───────── Brand tokens ─────────
const BLUE = '#3984BC';
const SKY = '#68B8D4';
const ORANGE = '#F3A23F';
const STROKE = 6; // one stroke weight for the whole icon family

const DURATION = 10; // seconds
const SIZE = 300; // stage size in px (SVG viewBox is 200 → 1 unit = 1.5px)
const LOGO_W = 280;
const LOGO_H = 200;
const TAGLINE = 'Find Your Place. Find Your People.';

// Typed loosely on purpose: newer React Native + Reanimated typings can hit
// "Type instantiation is excessively deep" on Animated.* components.
const AnimatedView: React.ComponentType<any> = Animated.View as any;
const AnimatedText: React.ComponentType<any> = Animated.Text as any;
const AnimatedPath: React.ComponentType<any> = Animated.createAnimatedComponent(Path) as any;
const AnimatedCircle: React.ComponentType<any> = Animated.createAnimatedComponent(Circle) as any;

// ───────── Timeline helpers (worklets) ─────────
type Ease = (x: number) => number;

const clamp01 = (x: number): number => {
  'worklet';
  return Math.min(1, Math.max(0, x));
};
const easeInOut: Ease = (x) => {
  'worklet';
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
const easeOut: Ease = (x) => {
  'worklet';
  return 1 - Math.pow(1 - x, 3);
};
const easeOutBack: Ease = (x) => {
  'worklet';
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
// progress 0→1 between time a and b (seconds), with easing
const seg = (t: number, a: number, b: number, ease?: Ease): number => {
  'worklet';
  const e = ease || easeInOut;
  return e(clamp01((t - a) / (b - a)));
};

// ───────── Paths (200 x 200 viewBox) ─────────
const HOUSE = 'M48 166 V92 L100 46 L152 92 V166 Z';
const HOUSE_LEN = 400;
const PIN =
  'M100 146 C92 138 84 130 84 122 A16 16 0 0 1 116 122 C116 130 108 138 100 146 Z';
const CONNECT = 'M82 100 Q100 82 118 100';
const CONNECT_LEN = 50;
const BUBBLE_BLUE =
  'M82 78 H118 Q130 78 130 90 V102 Q130 114 118 114 H92 L80 126 V114 H82 Q70 114 70 102 V90 Q70 78 82 78 Z';
const BUBBLE_ORANGE =
  'M82 78 H118 Q130 78 130 90 V102 Q130 114 118 114 H120 V126 L108 114 H82 Q70 114 70 102 V90 Q70 78 82 78 Z';
const ROOF = 'M40 108 L100 54 L160 108';
const ROOF_LEN = 170;

// ───────── Small components ─────────
type PersonProps = { cx: number; color: string };

// A person icon (head + shoulders) centred on cx
const Person = ({ cx, color }: PersonProps) => (
  <>
    <Circle cx={cx} cy={112} r={9} stroke={color} strokeWidth={STROKE} fill="none" />
    <Path
      d={`M${cx - 16} 148 Q${cx - 16} 128 ${cx} 128 Q${cx + 16} 128 ${cx + 16} 148`}
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </>
);

type LayerProps = {
  style?: any;
  children?: React.ReactNode;
};

// One full-size, absolutely positioned layer holding an SVG
const Layer = ({ style, children }: LayerProps) => (
  <AnimatedView pointerEvents="none" style={[styles.layer, style]}>
    <Svg width={SIZE} height={SIZE} viewBox="0 0 200 200">
      {children}
    </Svg>
  </AnimatedView>
);

// ───────── Main component ─────────
type Props = {
  /** Called exactly when the 10 second timeline finishes */
  onFinish?: () => void;
};

export default function RoommateSplash({ onFinish }: Props) {
  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    }
  };

  const t = useSharedValue(0); // master clock, 0 → 10 seconds

  useEffect(() => {
    t.value = withTiming(
      DURATION,
      { duration: DURATION * 1000, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(handleFinish)();
        }
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── 0–2s · THE SEARCH FOR HOME ──
  const sceneStyle = useAnimatedStyle(() => ({
    opacity: 1 - seg(t.value, 6.0, 6.6),
    transform: [
      {
        scale: interpolate(t.value, [0, 4, 6], [0.95, 1, 1.1], Extrapolation.CLAMP),
      },
    ],
  }));

  const houseProps = useAnimatedProps(() => ({
    strokeDashoffset: HOUSE_LEN * (1 - seg(t.value, 0.2, 1.5)),
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 1.0, 1.6) * 0.07,
  }));

  const pinStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 1.2, 1.6) * (1 - seg(t.value, 2.0, 2.4)),
    transform: [{ translateY: -10 * (1 - seg(t.value, 1.2, 1.7, easeOutBack)) }],
  }));

  const pulseProps = useAnimatedProps(() => {
    const k = t.value;
    const f = k > 1.7 ? ((k - 1.7) % 0.8) / 0.8 : 0;
    return {
      r: 8 + 20 * f,
      opacity: k > 1.7 && k < 2.4 ? 0.55 * (1 - f) : 0,
    };
  });

  // ── 2–4s · FINDING YOUR PEOPLE ──
  const personBlueStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 2.0, 2.5) * (1 - seg(t.value, 4.0, 4.5)),
    transform: [{ translateX: -170 * (1 - seg(t.value, 2.0, 3.0, easeOut)) }],
  }));
  const personOrangeStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 2.0, 2.5) * (1 - seg(t.value, 4.0, 4.5)),
    transform: [{ translateX: 170 * (1 - seg(t.value, 2.0, 3.0, easeOut)) }],
  }));

  const connectStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 3.0, 3.3) * (1 - seg(t.value, 4.0, 4.5)),
  }));
  const connectProps = useAnimatedProps(() => ({
    strokeDashoffset: CONNECT_LEN * (1 - seg(t.value, 3.0, 3.8)),
  }));

  // ── 4–6s · THE PERFECT MATCH ──
  const ringsStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 4.3, 4.9),
    transform: [
      { translateY: 42 }, // 28 viewBox units → sits at house centre
      { scale: 0.7 + 0.3 * seg(t.value, 4.3, 5.0, easeOutBack) },
    ],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 5.0, 5.2),
    transform: [
      { translateY: 42 },
      { scale: seg(t.value, 5.0, 5.6, easeOutBack) },
    ],
  }));

  // ── 6–8s · FROM STRANGERS TO ROOMMATES ──
  const bubbleBlueStyle = useAnimatedStyle(() => {
    const k = t.value;
    const x =
      -100 - 30 * (1 - seg(k, 6.2, 6.7, easeOut)) + 86 * seg(k, 7.1, 7.6);
    return {
      opacity: seg(k, 6.2, 6.6) * (1 - seg(k, 7.55, 7.95)),
      transform: [{ translateX: x * 1.5 }],
    };
  });
  const bubbleOrangeStyle = useAnimatedStyle(() => {
    const k = t.value;
    const x =
      100 + 30 * (1 - seg(k, 6.7, 7.2, easeOut)) - 86 * seg(k, 7.1, 7.6);
    return {
      opacity: seg(k, 6.7, 7.1) * (1 - seg(k, 7.55, 7.95)),
      transform: [{ translateX: x * 1.5 }],
    };
  });

  const roofStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 7.4, 7.6) * (1 - seg(t.value, 8.1, 8.6)),
  }));
  const roofProps = useAnimatedProps(() => ({
    strokeDashoffset: ROOF_LEN * (1 - seg(t.value, 7.4, 8.1)),
  }));

  // ── 8–10s · HERO LOGO REVEAL ──
  const glowStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 8.8, 9.5) * 0.9,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 8.0, 8.6),
    transform: [{ scale: 0.94 + 0.06 * seg(t.value, 8.0, 9.3, easeOut) }],
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 8.7, 8.9) * (1 - seg(t.value, 9.3, 9.45)),
    transform: [
      { translateX: -140 + 460 * seg(t.value, 8.7, 9.45) },
      { skewX: '-20deg' },
    ],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: seg(t.value, 9.0, 9.6),
    transform: [{ translateY: 8 * (1 - seg(t.value, 9.0, 9.6, easeOut)) }],
  }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.stage}>
        {/* Soft atmospheric glow behind the final logo */}
        <Layer style={glowStyle}>
          <Defs>
            <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={SKY} stopOpacity="0.22" />
              <Stop offset="1" stopColor={SKY} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Circle cx={100} cy={100} r={92} fill="url(#glow)" />
        </Layer>

        {/* SCENES 1–3: house, pin, people, match */}
        <AnimatedView pointerEvents="none" style={[styles.layer, sceneStyle]}>
          <Layer style={shadowStyle}>
            <Ellipse cx={100} cy={176} rx={58} ry={5} fill="#000000" />
          </Layer>

          <Layer>
            <AnimatedPath
              d={HOUSE}
              stroke={BLUE}
              strokeWidth={STROKE}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={`${HOUSE_LEN}`}
              animatedProps={houseProps}
            />
          </Layer>

          <Layer style={pinStyle}>
            <Path
              d={PIN}
              stroke={BLUE}
              strokeWidth={STROKE - 1}
              strokeLinejoin="round"
              fill="none"
            />
            <Circle cx={100} cy={122} r={5} fill={ORANGE} />
            <AnimatedCircle
              cx={100}
              cy={122}
              stroke={ORANGE}
              strokeWidth={2.5}
              fill="none"
              animatedProps={pulseProps}
            />
          </Layer>

          <Layer style={personBlueStyle}>
            <Person cx={76} color={BLUE} />
          </Layer>
          <Layer style={personOrangeStyle}>
            <Person cx={124} color={ORANGE} />
          </Layer>

          <Layer style={connectStyle}>
            <AnimatedPath
              d={CONNECT}
              stroke={SKY}
              strokeWidth={STROKE - 2}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${CONNECT_LEN}`}
              animatedProps={connectProps}
            />
            <Circle cx={100} cy={91} r={3.5} fill={SKY} />
          </Layer>

          {/* Interlocking match rings (drawn at y=100, shifted down by style) */}
          <Layer style={ringsStyle}>
            <Circle cx={86} cy={100} r={24} stroke={BLUE} strokeWidth={STROKE} fill="none" />
            <Circle cx={114} cy={100} r={24} stroke={ORANGE} strokeWidth={STROKE} fill="none" />
          </Layer>
          <Layer style={checkStyle}>
            <Circle cx={100} cy={100} r={12} fill={SKY} />
            <Path
              d="M93.5 100 L98 104.5 L106.5 95"
              stroke="#FFFFFF"
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Layer>
        </AnimatedView>

        {/* SCENE 4: chat bubbles meet and become a roof */}
        <Layer style={bubbleBlueStyle}>
          <Path
            d={BUBBLE_BLUE}
            stroke={BLUE}
            strokeWidth={STROKE}
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
        </Layer>
        <Layer style={bubbleOrangeStyle}>
          <Path
            d={BUBBLE_ORANGE}
            stroke={ORANGE}
            strokeWidth={STROKE}
            strokeLinejoin="round"
            fill="#FFFFFF"
          />
        </Layer>

        <Layer style={roofStyle}>
          <Defs>
            <LinearGradient id="roof" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={BLUE} />
              <Stop offset="0.5" stopColor={SKY} />
              <Stop offset="1" stopColor={ORANGE} />
            </LinearGradient>
          </Defs>
          <AnimatedPath
            d={ROOF}
            stroke="url(#roof)"
            strokeWidth={STROKE + 3}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray={`${ROOF_LEN}`}
            animatedProps={roofProps}
          />
        </Layer>

        {/* SCENE 5: official logo (the real image, never redrawn) */}
        <AnimatedView pointerEvents="none" style={[styles.logoWrap, logoStyle]}>
          <Image
            source={LOGO}
            style={{ width: LOGO_W, height: LOGO_H }}
            resizeMode="contain"
          />
          {/* blue → orange light sweep, clipped to the logo frame */}
          <View style={styles.sweepClip}>
            <AnimatedView style={[styles.sweep, sweepStyle]}>
              <Svg width={90} height={LOGO_H}>
                <Defs>
                  <LinearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={BLUE} stopOpacity="0" />
                    <Stop offset="0.35" stopColor={BLUE} stopOpacity="0.28" />
                    <Stop offset="0.65" stopColor={ORANGE} stopOpacity="0.28" />
                    <Stop offset="1" stopColor={ORANGE} stopOpacity="0" />
                  </LinearGradient>
                </Defs>
                <Rect width={90} height={LOGO_H} fill="url(#sweep)" />
              </Svg>
            </AnimatedView>
          </View>
        </AnimatedView>
      </View>

      <AnimatedText style={[styles.tagline, taglineStyle]}>{TAGLINE}</AnimatedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: { width: SIZE, height: SIZE },
  layer: { position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE },
  logoWrap: {
    position: 'absolute',
    left: (SIZE - LOGO_W) / 2,
    top: (SIZE - LOGO_H) / 2,
    width: LOGO_W,
    height: LOGO_H,
  },
  sweepClip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  sweep: { position: 'absolute', top: 0, left: 0, width: 90, height: LOGO_H },
  tagline: {
    marginTop: -28,
    fontSize: 16,
    letterSpacing: 0.6,
    color: BLUE,
    fontWeight: '500',
    textAlign: 'center',
  },
});
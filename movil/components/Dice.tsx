import React, { FC, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PanResponder, StyleSheet } from 'react-native';
import Svg, { Polygon, Circle } from 'react-native-svg';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';
import * as gameItems from '@/utils/gameitems.json';

const SWIPE_THRESHOLD = 10;
const STOP_DELAY_MS = 1500;

type Point = { x: number; y: number };
interface diceProps {
    initialValue: number;
    onSpinComplete: (finalValue: number) => void;
    onSpinStart?: () => void;
    position: Point;
    scale: number;
    colors: { faceUpColor: string, faceLeftColor: string, faceRightColor: string, line: string, dots: string };
    lineWidth: number;
    isAnimated?: boolean;
    autoSpin?: boolean;
}

const Dice: FC<diceProps> = (props) => {
    const [diceValue, setDiceValue] = useState(props.initialValue);
    const [diceRolling, setDiceRolling] = useState(false);
    const diceRollingRef = useRef(false);
    const gestureStartedWhileRollingRef = useRef(false);
    const stopTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rotation = useSharedValue(0);
    const [diceDots, setDiceDots] = useState(props.isAnimated ? gameItems.diceValues[diceValue - 1] : gameItems.diceDotFaceUp[diceValue - 1]);
    const onSpinCompleteRef = useRef(props.onSpinComplete);
    onSpinCompleteRef.current = props.onSpinComplete;

    useEffect(() => {
        setDiceDots(props.isAnimated ? gameItems.diceValues[diceValue - 1] : gameItems.diceDotFaceUp[diceValue - 1])
    }, [diceValue]);

    const startSpin = useCallback(() => {
        if (diceRollingRef.current) return;
        if (stopTimeout.current) {
            clearTimeout(stopTimeout.current);
            stopTimeout.current = null;
        }

        diceRollingRef.current = true;
        props.onSpinStart?.();
        setDiceRolling(true);
        rotation.value = withRepeat(
            withTiming(360, { duration: 500, easing: Easing.linear }),
            -1,
            false
        );
    }, [props.onSpinStart, rotation]);

    const stopAndComplete = useCallback(() => {
        if (stopTimeout.current) {
            clearTimeout(stopTimeout.current);
            stopTimeout.current = null;
        }
        if (!diceRollingRef.current) return;

        cancelAnimation(rotation);
        diceRollingRef.current = false;
        setDiceRolling(false);
        const newDiceValue = Math.floor(Math.random() * 6) + 1;
        setDiceValue(newDiceValue);
        rotation.value = 0;
        onSpinCompleteRef.current(newDiceValue);
    }, [rotation]);

    const scheduleStop = useCallback(() => {
        if (!diceRollingRef.current) return;
        if (stopTimeout.current) clearTimeout(stopTimeout.current);
        stopTimeout.current = setTimeout(stopAndComplete, STOP_DELAY_MS);
    }, [stopAndComplete]);

    const handlePanResponderGrant = useCallback(() => {
        gestureStartedWhileRollingRef.current = diceRollingRef.current;
        startSpin();
    }, [startSpin]);

    const handlePanResponderRelease = useCallback((_event: unknown, gestureState: { dx: number; dy: number }) => {
        const isTapToStop =
            gestureStartedWhileRollingRef.current &&
            Math.hypot(gestureState.dx, gestureState.dy) < SWIPE_THRESHOLD &&
            !props.autoSpin;
        gestureStartedWhileRollingRef.current = false;

        if (isTapToStop) {
            stopAndComplete();
        } else {
            scheduleStop();
        }
    }, [props.autoSpin, scheduleStop, stopAndComplete]);

    const panResponder = useMemo(() => PanResponder.create({
        onStartShouldSetPanResponder: () =>
            Boolean(props.isAnimated) && !props.autoSpin && diceRollingRef.current,
        onMoveShouldSetPanResponder: (_event, gestureState) =>
            Boolean(props.isAnimated) && !props.autoSpin &&
            Math.hypot(gestureState.dx, gestureState.dy) >= SWIPE_THRESHOLD,
        onPanResponderGrant: handlePanResponderGrant,
        onPanResponderRelease: handlePanResponderRelease,
        onPanResponderTerminate: () => {
            gestureStartedWhileRollingRef.current = false;
            scheduleStop();
        },
        onPanResponderTerminationRequest: () => false,
    }), [handlePanResponderGrant, handlePanResponderRelease, props.autoSpin, props.isAnimated, scheduleStop]);

    useEffect(() => {
        if (!props.autoSpin || diceRollingRef.current) return;
        const t1 = setTimeout(startSpin, 500);
        const t2 = setTimeout(stopAndComplete, 2000);
        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, [props.autoSpin, startSpin, stopAndComplete]);

    const faceUp = "39,44, 0,22 39,0 78,22";
    const faceLeft = "39,44 0,22 0,70 39,92";
    const faceRight = "39,44 78,22 78,70 39,92";

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotateZ: `${rotation.value}deg` },
                { scale: props.scale }
            ],
        };
    });

    useEffect(() => {
        return () => {
            if (stopTimeout.current) clearTimeout(stopTimeout.current);
            cancelAnimation(rotation);
        };
    }, [rotation]);

    return (
        <Animated.View
            style={[
                styles.dice,
                { left: props.position.x, top: props.position.y },
                animatedStyle,
            ]}
            {...panResponder.panHandlers}
        >
            <Svg width={78} height={92} viewBox="0 0 78 92" pointerEvents="none">
                <Polygon points={faceUp} fill={props.colors.faceUpColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
                <Polygon points={faceLeft} fill={props.colors.faceLeftColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
                <Polygon points={faceRight} fill={props.colors.faceRightColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
                {diceDots.map((point, index) => (
                    <Circle key={index} cx={point.x} cy={point.y} r={5} fill={diceRolling ? 'transparent' : props.colors.dots} />
                ))}
            </Svg>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    dice: {
        position: 'absolute',
        width: 78,
        height: 92,
    },
});

export default Dice;

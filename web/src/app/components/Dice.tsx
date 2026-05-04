import { useState, useEffect } from 'react';
import { motion, useAnimate } from 'motion/react';
import * as gameItems from '../../utils/gameItems.json';

type Point = { x: number; y: number };
interface diceProps {
   initialValue: number;
   onSpinComplete?: (finalValue: number) => void;
   position: Point;
   scale: number;
   colors: { faceUpColor: string, faceLeftColor: string, faceRightColor: string, line: string, dots: string };
   lineWidth: number;
   isAnimated?: boolean;
}

const Dice: React.FC<diceProps> = (props) => {
   const [diceValue, setDiceValue] = useState(props.initialValue);
   const [diceRolling, setDiceRolling] = useState(false);
   const [scope, animate] = useAnimate<SVGGElement>();

   const [diceDots, setDiceDots] = useState(
      props.isAnimated ? gameItems.diceValues[diceValue - 1] : gameItems.diceDotFaceUp[diceValue - 1]
   );

   useEffect(() => {
      setDiceDots(
         props.isAnimated ? gameItems.diceValues[diceValue - 1] : gameItems.diceDotFaceUp[diceValue - 1]
      );
   }, [diceValue, props.isAnimated]);

   const faceUp = "39,44, 0,22 39,0 78,22";
   const faceLeft = "39,44 0,22 0,70 39,92";
   const faceRight = "39,44 78,22 78,70 39,92";
   const centerX = 39;
   const centerY = 46;

   const diceClicked = async () => {
      if (!diceRolling && props.isAnimated) {
         // Start spinning
         setDiceRolling(true);
         animate(scope.current, { rotate: 360 }, {
            duration: 0.5,
            ease: 'linear',
            repeat: Infinity,
         });
      } else if (diceRolling) {
         // Stop spinning
         animate(scope.current, { rotate: 0 }, { duration: 0.15 });
         setDiceRolling(false);
         const newDiceValue = Math.floor(Math.random() * 6) + 1;
         setDiceValue(newDiceValue);
         props.onSpinComplete?.(newDiceValue);
      }
   };

   return (
      <motion.g
         ref={scope}
         onClick={diceClicked}
         style={{
            cursor: props.isAnimated ? 'pointer' : 'default',
            transformOrigin: `${props.position.x + centerX}px ${props.position.y + centerY}px`,
         }}
         transform={`scale(${props.scale}) translate(${props.position.x},${props.position.y})`}
      >
         <polygon points={faceUp} fill={props.colors.faceUpColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
         <polygon points={faceLeft} fill={props.colors.faceLeftColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
         <polygon points={faceRight} fill={props.colors.faceRightColor} stroke={props.colors.line} strokeWidth={props.lineWidth} />
         {diceDots.map((point: Point, index: number) => (
            <circle key={index} cx={point.x} cy={point.y} r={5} fill={diceRolling ? 'transparent' : props.colors.dots} />
         ))}
      </motion.g>
   );
}

export default Dice;
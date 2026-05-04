import { useEffect, useRef, useState } from 'react';
import { motion, useAnimate } from 'motion/react';
import runningEffectSrc from '../../assets/sounds/cartoon-running-footsteps.mp3';
import { useBoardContext } from "../../store/BoardProvider.tsx";
import type { PlayingUserType } from '../../utils/types.ts';

interface playerProps {
   playerId: number; // ID del jugador para identificarlo en el callback
   playerIndex: number; // Índice del jugador (0-5) para calcular separación en la salida
   initialTile: number; //Casilla inicial del jugador    
   targetTile: number;
   scale: number;
   color: { fill: string, border: string, eyes: string };
   tilesCoords: { x: number, y: number }[]; // Array con las posiciones de todas las casillas
   onMoveComplete?: (finalIndex: number, playerId: number) => void; // Callback when animation sequence finishes
}
const playerIdxOffSet = [{ x: -5, y: 0 }, { x: 5, y: 0 }, { x: -3, y: -3 }, { x: 3, y: -3 }, { x: -3, y: 3 }, { x: 3, y: 3 }]

const Player: React.FC<playerProps> = (props) => {
   const { playingUsers } = useBoardContext();
   const [scope, animate] = useAnimate<SVGGElement>();
   const currentTileRef = useRef(props.initialTile);
   const audioRef = useRef<HTMLAudioElement | null>(null);
   const [isReady, setIsReady] = useState(false);

   const playerInfo = playingUsers.findIndex((p: PlayingUserType) => p.id === props.playerId);

   // Initialize audio element once
   useEffect(() => {
      const audio = new Audio(runningEffectSrc);
      audio.loop = true;
      audioRef.current = audio;
      setIsReady(true);
      return () => {
         audio.pause();
         audio.src = '';
      };
   }, []);

   // Calcula un desplazamiento dependiendo de si la casilla es la 0 (salida) o cualquier otra
   const getOffset = (tileIndex: number) => {
      if (tileIndex === 0) return { x: props.playerIndex * 40, y: 0 };
      return { x: -15 + playerIdxOffSet[props.playerIndex].x, y: -30 + playerIdxOffSet[props.playerIndex].y };
   };

   // Set initial position once ready
   useEffect(() => {
      if (!isReady || !scope.current) return;
      const pos = props.initialTile < props.tilesCoords.length ? props.tilesCoords[props.initialTile] : { x: 0, y: 0 };
      const offset = getOffset(props.initialTile);
      scope.current.setAttribute('transform', `translate(${pos.x + offset.x}, ${pos.y + offset.y}) scale(${props.scale})`);
   }, [isReady]);

   // Animate movement when targetTile changes
   useEffect(() => {
      if (!isReady || !scope.current) return;

      const fromTile = currentTileRef.current;
      const toTile = props.targetTile;

      if (fromTile === toTile) {
         // No movement needed, just snap to position
         const targetPos = props.tilesCoords[toTile];
         const offset = getOffset(toTile);
         scope.current.setAttribute('transform', `translate(${targetPos.x + offset.x}, ${targetPos.y + offset.y}) scale(${props.scale})`);
         currentTileRef.current = toTile;
         return;
      }

      const fromPos = props.tilesCoords[fromTile];
      const fromOffset = getOffset(fromTile);
      const targetPos = props.tilesCoords[toTile];
      const targetOffset = getOffset(toTile);

      const startX = fromPos.x + fromOffset.x;
      const startY = fromPos.y + fromOffset.y;
      const endX = targetPos.x + targetOffset.x;
      const endY = targetPos.y + targetOffset.y;

      // Play running sound
      if (audioRef.current) {
         audioRef.current.currentTime = 0;
         audioRef.current.play().catch(() => { /* user hasn't interacted yet */ });
      }

      // Animate using motion's WAAPI-based animate on the transform
      // We use x/y for the translation delta from start position
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Set the starting transform explicitly
      scope.current.setAttribute('transform', `translate(${startX}, ${startY}) scale(${props.scale})`);

      animate(scope.current,
         { x: [0, deltaX], y: [0, deltaY] },
         { duration: 0.5, ease: 'linear' }
      ).then(() => {
         // Snap to final position using SVG transform (clean up motion styles)
         if (scope.current) {
            scope.current.style.transform = '';
            scope.current.setAttribute('transform', `translate(${endX}, ${endY}) scale(${props.scale})`);
         }
         currentTileRef.current = toTile;

         // Pause sound
         if (audioRef.current) {
            audioRef.current.pause();
         }

         // Notify parent
         props.onMoveComplete?.(toTile, props.playerId);
      });
   }, [props.targetTile]);

   return (
      <motion.g ref={scope}>
         <path d="M18.7 42.2 C19.5 40.2 22.3 40.1 23.2 42 L23.3 42.2 L38.4 78.8 C39 80.4 37.8 82.2 36 82.2 H5.9 C4.2 82.2 3 80.5 3.6 78.9 L3.6 78.8 L18.7 42.2 Z" fill={props.color.fill} stroke={props.color.border} strokeWidth={5} />
         <ellipse cx="23" cy="23" rx="21" ry="20" fill={props.color.fill} stroke={props.color.border} strokeWidth={5} strokeLinecap='round' strokeLinejoin='round' />
         <ellipse rx="3" ry="5" cx="16" cy="16" fill={props.color.eyes} />
         <ellipse rx="3" ry="5" cx="29" cy="16" fill={props.color.eyes} />
         <text fill={props.color.border} stroke='none' fontSize="20" fontWeight="bold" x="20" y="80" textAnchor="middle">
            {playerInfo !== -1 ? playingUsers[playerInfo].username.length > 10 ? playingUsers[playerInfo].username.substring(0, 10) + '...' : playingUsers[playerInfo].username : '?'}
         </text>
      </motion.g>
   );
}

export default Player
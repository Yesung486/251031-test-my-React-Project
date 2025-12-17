import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { GameStatus, LevelData } from '../types';
import { COLORS, DIMENSIONS } from '../constants';
import { playSound } from '../utils/audio';

interface GameCanvasProps {
  levelConfig: LevelData;
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
  onInkUpdate: (current: number, max: number) => void;
  gameKey: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  levelConfig, 
  status, 
  setStatus, 
  onInkUpdate,
  gameKey 
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const carRef = useRef<Matter.Composite | null>(null);
  const cargoRef = useRef<Matter.Body | null>(null);
  
  // Interaction State
  const isDrawingRef = useRef(false);
  const lastDrawPosRef = useRef<{ x: number; y: number } | null>(null);
  const inkUsedRef = useRef(0);
  
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);
  
  // Helper to create the car
  const createCar = (x: number, y: number) => {
    const group = Matter.Body.nextGroup(true);
    
    // Chassis: Boxy, low chamfer, high friction to catch on edges
    const chassis = Matter.Bodies.rectangle(x, y, DIMENSIONS.CAR_WIDTH, DIMENSIONS.CAR_HEIGHT, { 
      collisionFilter: { group: group },
      chamfer: { radius: 4 }, // Sharper corners to hit bumps
      render: { fillStyle: COLORS.CAR_CHASSIS },
      density: 0.002,
      friction: 0.8, // If chassis hits ground, it drags hard
      label: 'CarChassis'
    });

    // Wheels: Positioned to give low ground clearance
    const wheelYOffset = 20; // Closer to chassis center = lower clearance relative to wheel bottom
    
    const wheelA = Matter.Bodies.circle(x - 45, y + wheelYOffset, DIMENSIONS.WHEEL_SIZE, { 
      collisionFilter: { group: group },
      friction: 0.8, 
      restitution: 0.1, 
      render: { fillStyle: COLORS.CAR_WHEEL },
      label: 'CarWheel'
    });
    
    const wheelB = Matter.Bodies.circle(x + 45, y + wheelYOffset, DIMENSIONS.WHEEL_SIZE, { 
      collisionFilter: { group: group },
      friction: 0.8,
      restitution: 0.1,
      render: { fillStyle: COLORS.CAR_WHEEL },
      label: 'CarWheel'
    });

    const axelA = Matter.Constraint.create({
      bodyA: chassis,
      bodyB: wheelA,
      pointB: { x: 0, y: 0 },
      pointA: { x: -45, y: wheelYOffset },
      stiffness: levelConfig.carStability,
      damping: 0.2, 
      length: 0
    });

    const axelB = Matter.Constraint.create({
      bodyA: chassis,
      bodyB: wheelB,
      pointB: { x: 0, y: 0 },
      pointA: { x: 45, y: wheelYOffset },
      stiffness: levelConfig.carStability,
      damping: 0.2,
      length: 0
    });

    const carComposite = Matter.Composite.create({
      bodies: [chassis, wheelA, wheelB],
      constraints: [axelA, axelB]
    });

    return carComposite;
  };

  // Helper: Create unique terrain based on config
  const createTerrain = (width: number, height: number) => {
    const bodies: Matter.Body[] = [];
    
    const centerX = width / 2;
    const baseY = height - 150;
    
    // Safety check: Ensure start platform is always at least 250px wide for the car
    const safeZoneWidth = 250;
    
    // Calculate gap positions
    const gapHalf = levelConfig.gapWidth / 2;
    let startRightX = centerX - gapHalf;
    
    // If gap is too far left, push it right to maintain safe zone
    if (startRightX < safeZoneWidth) {
        startRightX = safeZoneWidth;
    }
    
    const endLeftX = startRightX + levelConfig.gapWidth;
    
    const startY = baseY;
    const endY = baseY - levelConfig.heightDiff;

    const cliffColor = COLORS.CLIFF;

    // --- 1. STARTING STRUCTURE (LEFT) ---
    // Guaranteed Safe Zone
    const safeZone = Matter.Bodies.rectangle(safeZoneWidth / 2, startY + 500, safeZoneWidth, 1000, {
        isStatic: true,
        render: { fillStyle: cliffColor },
        label: 'Ground'
    });
    bodies.push(safeZone);

    // Terrain feature between safe zone and gap
    const featureWidth = startRightX - safeZoneWidth;
    if (featureWidth > 0) {
        const featureCenterX = safeZoneWidth + featureWidth / 2;
        
        if (levelConfig.terrainType === 'RAMP_DOWN') {
            const ramp = Matter.Bodies.trapezoid(featureCenterX, startY + 50, featureWidth, 100, 0.8, {
                isStatic: true,
                angle: Math.PI / 12,
                render: { fillStyle: cliffColor },
                label: 'Ground'
            });
            // Support pillar
            const pillar = Matter.Bodies.rectangle(featureCenterX, startY + 550, featureWidth, 900, {
                 isStatic: true,
                 render: { fillStyle: cliffColor },
                 label: 'Ground'
            });
            bodies.push(ramp, pillar);
        } else if (levelConfig.terrainType === 'JAGGED') {
            const jagged = Matter.Bodies.polygon(featureCenterX, startY, 5, featureWidth / 2, {
                isStatic: true,
                render: { fillStyle: cliffColor },
                label: 'Ground'
            });
            const pillar = Matter.Bodies.rectangle(featureCenterX, startY + 500, featureWidth, 1000, {
                isStatic: true,
                render: { fillStyle: cliffColor },
                label: 'Ground'
           });
            bodies.push(jagged, pillar);
        } else {
             const block = Matter.Bodies.rectangle(featureCenterX, startY + 500, featureWidth, 1000, {
                 isStatic: true,
                 render: { fillStyle: cliffColor },
                 label: 'Ground'
             });
             bodies.push(block);
        }
    }


    // --- 2. ENDING STRUCTURE (RIGHT) ---
    const endWidth = width - endLeftX;
    const endCenterX = endLeftX + endWidth / 2;
    
    // Base Pillar for Right Side (Visual foundation)
    const rightPillar = Matter.Bodies.rectangle(endCenterX, endY + 600, endWidth, 1000, {
        isStatic: true,
        render: { fillStyle: cliffColor },
        label: 'Ground'
    });
    bodies.push(rightPillar);

    if (levelConfig.terrainType === 'RAMP_UP') {
         const rampSurface = Matter.Bodies.rectangle(endLeftX + 150, endY + 50, 300, 40, {
            isStatic: true,
            angle: -0.3, // Slope up
            render: { fillStyle: cliffColor },
            label: 'Ground'
        });
        // Connect ramp to pillar
        const connector = Matter.Bodies.rectangle(endCenterX, endY + 100, endWidth, 200, {
             isStatic: true,
             render: { fillStyle: cliffColor },
             label: 'Ground'
        });
        bodies.push(rampSurface, connector);

    } else if (levelConfig.terrainType === 'STAIRS') {
        const stepWidth = 100;
        const stepHeight = 60;
        for (let i = 0; i < 4; i++) {
             const stepX = endLeftX + (i * stepWidth) + (stepWidth/2);
             const stepY = endY + 100 - (i * stepHeight); // Adjusted height
             
             bodies.push(Matter.Bodies.rectangle(
                 stepX,
                 stepY, // Top part
                 stepWidth,
                 40,
                 {
                    isStatic: true,
                    render: { fillStyle: cliffColor },
                    label: 'Ground'
                 }
             ));
             // Visual support for step
             bodies.push(Matter.Bodies.rectangle(
                 stepX,
                 stepY + 270, // Extends down to merge with pillar
                 stepWidth,
                 500,
                 {
                    isStatic: true,
                    render: { fillStyle: cliffColor },
                    label: 'Ground'
                 }
             ));
        }
    } else {
        // Just the top cap for standard ground
        const topCap = Matter.Bodies.rectangle(endCenterX, endY + 100, endWidth, 200, {
             isStatic: true,
             render: { fillStyle: cliffColor },
             label: 'Ground'
        });
        bodies.push(topCap);
    }

    // --- 3. SPECIAL TERRAIN FEATURES (Middle Structures) ---
    
    if (levelConfig.terrainType === 'ISLAND') {
        // Floating Island with a "support" look (maybe a floating rock or pillar from bottom?)
        // Let's make it a floating rock for now, but thicker
        const island = Matter.Bodies.rectangle(centerX, baseY, 180, 60, {
             isStatic: true,
             chamfer: { radius: 10 },
             render: { fillStyle: COLORS.OBSTACLE },
             label: 'Ground'
        });
        bodies.push(island);
    } else if (levelConfig.terrainType === 'NARROW_PEAK') {
        // A tall pillar from bottom
        const peak = Matter.Bodies.polygon(centerX, height, 3, height - baseY - 50, {
             isStatic: true,
             render: { fillStyle: COLORS.OBSTACLE },
             label: 'Ground'
        });
        // Correction: Polygon positioning can be tricky. Let's use a skinny triangle on a stick.
        const stick = Matter.Bodies.rectangle(centerX, height - 200, 40, 400, {
             isStatic: true,
             render: { fillStyle: COLORS.OBSTACLE },
             label: 'Ground'
        });
        const triangle = Matter.Bodies.polygon(centerX, baseY, 3, 60, {
             isStatic: true,
             angle: Math.PI/6,
             render: { fillStyle: COLORS.OBSTACLE },
             label: 'Ground'
        });

        bodies.push(stick, triangle);
    }

    // --- 4. GOAL FLAG ---
    const goalY = levelConfig.terrainType === 'STAIRS' ? endY - 180 : endY - 80;
    
    const goalLine = Matter.Bodies.rectangle(width - 50, goalY, 20, 160, {
        isStatic: true,
        isSensor: true,
        render: { fillStyle: COLORS.GOAL, opacity: 0.5 },
        label: 'Goal'
    });
    bodies.push(goalLine);

    return bodies;
  };

  // Initialize Physics Engine
  useEffect(() => {
    if (!sceneRef.current) return;

    if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        if (renderRef.current.canvas) renderRef.current.canvas.remove();
    }
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (engineRef.current) Matter.Engine.clear(engineRef.current);

    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;

    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: '#0f172a',
        pixelRatio: window.devicePixelRatio 
      }
    });
    renderRef.current = render;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    // --- Generate Level ---
    const terrainBodies = createTerrain(width, height);
    
    // Add Obstacles from Config
    const obstacleBodies = levelConfig.obstacles.map(obs => {
        return Matter.Bodies.rectangle(
            (width / 2) + obs.x,
            (height - 150) + obs.y,
            obs.w,
            obs.h,
            {
                isStatic: obs.isStatic ?? true,
                angle: obs.rotation ?? 0,
                render: { fillStyle: COLORS.OBSTACLE },
                label: 'Obstacle'
            }
        );
    });

    Matter.World.add(world, [...terrainBodies, ...obstacleBodies]);

    // Determine Start Position
    // Safe zone is always 0-250. Spawn car at 100.
    const startX = 100;
    
    // Calculate accurate startY based on terrain height logic
    const baseY = height - 150;
    const startCarY = baseY - 100; // Drop it slightly above ground
    
    const car = createCar(startX, startCarY);
    carRef.current = car;
    Matter.World.add(world, car);

    // Add Cargo
    if (levelConfig.hasCargo) {
      const box = Matter.Bodies.rectangle(startX, startCarY - 40, 40, 40, {
        render: { fillStyle: COLORS.CARGO },
        friction: 0.9,
        density: 0.005,
        label: 'Cargo'
      });
      cargoRef.current = box;
      Matter.World.add(world, box);
    } else {
        cargoRef.current = null;
    }

    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    // --- Game Loop ---
    
    Matter.Events.on(runner, 'beforeUpdate', () => {
        if (statusRef.current === GameStatus.RUNNING && carRef.current) {
            carRef.current.bodies.forEach(body => {
                if (body.label === 'CarWheel') {
                    // Reduced torque further to 0.15 for more struggle
                    Matter.Body.setAngularVelocity(body, 0.15); 
                }
            });
        }
    });

    Matter.Events.on(runner, 'afterUpdate', () => {
        if (!carRef.current) return;
        const currentStatus = statusRef.current;

        const chassis = carRef.current.bodies.find(b => b.label === 'CarChassis');
        if (!chassis) return;

        // Check Win
        if (chassis.position.x > width - 80 && currentStatus === GameStatus.RUNNING) {
            // Check Cargo survival
            if (levelConfig.hasCargo && cargoRef.current) {
                const dist = Math.abs(cargoRef.current.position.x - chassis.position.x);
                // Stricter check: must be near car
                if (dist > 250 || cargoRef.current.position.y > height) {
                     return; 
                }
            }
            setStatus(GameStatus.WON);
            playSound('win');
            runner.enabled = false;
        }

        // Check Lose (Fell)
        if (chassis.position.y > height + 200 && currentStatus === GameStatus.RUNNING) {
            setStatus(GameStatus.LOST);
            playSound('lose');
            runner.enabled = false;
        }
        
        // Cargo Lose Check
        if (levelConfig.hasCargo && cargoRef.current && currentStatus === GameStatus.RUNNING) {
             if (cargoRef.current.position.y > height + 100) {
                 setStatus(GameStatus.LOST);
                 playSound('lose');
                 runner.enabled = false;
             }
        }
    });

    inkUsedRef.current = 0;
    onInkUpdate(0, levelConfig.inkLimit);

    return () => {
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        if (engineRef.current) Matter.Engine.clear(engineRef.current);
        if (render.canvas) render.canvas.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameKey, levelConfig]);

  useEffect(() => {
      if (status === GameStatus.RUNNING) {
          playSound('start');
      }
  }, [status]);


  // --- Drawing Logic ---

  const handlePointerDown = (e: React.PointerEvent) => {
    if (status !== GameStatus.PLANNING) return;
    isDrawingRef.current = true;
    lastDrawPosRef.current = null;
    (e.target as Element).setPointerCapture(e.pointerId);
    
    const rect = (e.target as Element).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    lastDrawPosRef.current = { x, y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawingRef.current || status !== GameStatus.PLANNING || !engineRef.current) return;

    const rect = (e.target as Element).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (inkUsedRef.current >= levelConfig.inkLimit) return;

    const threshold = 15;
    const lastPos = lastDrawPosRef.current;
    
    if (lastPos) {
        const dist = Math.hypot(x - lastPos.x, y - lastPos.y);
        
        if (dist > threshold) {
            const midX = (x + lastPos.x) / 2;
            const midY = (y + lastPos.y) / 2;
            const angle = Math.atan2(y - lastPos.y, x - lastPos.x);
            
            const bridgeSegment = Matter.Bodies.rectangle(midX, midY, dist + 2, 12, {
                isStatic: true,
                angle: angle,
                render: { fillStyle: COLORS.BRIDGE },
                chamfer: { radius: 3 },
                label: 'BridgeNode'
            });
            
            Matter.World.add(engineRef.current.world, bridgeSegment);
            
            inkUsedRef.current += dist;
            onInkUpdate(inkUsedRef.current, levelConfig.inkLimit);
            
            lastDrawPosRef.current = { x, y };
            playSound('draw');
        }
    } else {
        lastDrawPosRef.current = { x, y };
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDrawingRef.current = false;
    lastDrawPosRef.current = null;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div 
        ref={sceneRef} 
        className="w-full h-full cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
    />
  );
};

export default GameCanvas;
import Head from 'next/head'
import { useMemo, useRef, useState } from 'react'

const CYCLE_SECONDS = 16
const STEP_SECONDS = 4

const BACKGROUNDS = [
  {
    id: 'meadow',
    label: 'Sunny Meadow (default)',
    image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'snowy-mountain',
    label: 'Pristine Snowy Mountainside',
    image:
      'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'beach',
    label: 'Relaxing Beach View',
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  },
  {
    id: 'austrian-countryside',
    label: 'Austrian Countryside',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
  },
]

function getBreathLevel(secondsInCycle) {
  if (secondsInCycle < STEP_SECONDS) {
    return secondsInCycle / STEP_SECONDS
  }

  if (secondsInCycle < STEP_SECONDS * 2) {
    return 1
  }

  if (secondsInCycle < STEP_SECONDS * 3) {
    return 1 - (secondsInCycle - STEP_SECONDS * 2) / STEP_SECONDS
  }

  return 0
}

function getBreathInstruction(secondsInCycle) {
  if (secondsInCycle < STEP_SECONDS) {
    return 'Inhale'
  }

  if (secondsInCycle < STEP_SECONDS * 2) {
    return 'Hold'
  }

  if (secondsInCycle < STEP_SECONDS * 3) {
    return 'Exhale'
  }

  return 'Hold'
}

export default function Home() {
  const [screen, setScreen] = useState('home')
  const [selectedBackground, setSelectedBackground] = useState(BACKGROUNDS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  const animationRef = useRef(null)
  const startTimeRef = useRef(0)

  const secondsInCycle = elapsedSeconds % CYCLE_SECONDS
  const completedCycles = Math.floor(elapsedSeconds / CYCLE_SECONDS)
  const breathLevel = getBreathLevel(secondsInCycle)

  const graph = {
    width: 640,
    height: 320,
    padding: 40,
  }

  const graphPoints = useMemo(() => {
    const dataPoints = []

    for (let second = 0; second <= CYCLE_SECONDS; second += 0.2) {
      const phaseSeconds = Math.min(second, CYCLE_SECONDS - 0.0001)
      const level = getBreathLevel(phaseSeconds)
      const x = graph.padding + (second / CYCLE_SECONDS) * (graph.width - graph.padding * 2)
      const y = graph.height - graph.padding - level * (graph.height - graph.padding * 2)
      dataPoints.push(`${x},${y}`)
    }

    return dataPoints.join(' ')
  }, [])

  const ballPosition = {
    x: graph.padding + (secondsInCycle / CYCLE_SECONDS) * (graph.width - graph.padding * 2),
    y: graph.height - graph.padding - breathLevel * (graph.height - graph.padding * 2),
  }

  const stopAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const runAnimation = (timestamp) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp - elapsedSeconds * 1000
    }

    const newElapsedSeconds = (timestamp - startTimeRef.current) / 1000
    setElapsedSeconds(newElapsedSeconds)
    animationRef.current = requestAnimationFrame(runAnimation)
  }

  const onPlay = () => {
    if (isPlaying) {
      return
    }

    setIsPlaying(true)
    startTimeRef.current = 0
    animationRef.current = requestAnimationFrame(runAnimation)
  }

  const onPause = () => {
    setIsPlaying(false)
    stopAnimation()
  }

  const onReset = () => {
    setIsPlaying(false)
    stopAnimation()
    setElapsedSeconds(0)
    startTimeRef.current = 0
  }

  const onBackToSelection = () => {
    onReset()
    setScreen('setup')
  }

  return (
    <div className="container">
      <Head>
        <title>Box Breathing Program</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {screen === 'home' && (
        <main className="homeMain">
          <h1>Performance Recovery Hub</h1>
          <p className="description">
            Add this breathing module to your home screen workflow for sports and motion analysis sessions.
          </p>
          <button className="ctaButton" onClick={() => setScreen('setup')}>
            Open Box Breathing Program
          </button>
        </main>
      )}

      {screen === 'setup' && (
        <main className="setupMain">
          <h1>Choose a calming background</h1>
          <p className="description">The meadow image is pre-selected as the standard graph background.</p>
          <div className="backgroundList" role="listbox" aria-label="Background options">
            {BACKGROUNDS.map((background) => {
              const isSelected = selectedBackground.id === background.id
              return (
                <button
                  key={background.id}
                  className={`backgroundCard ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedBackground(background)}
                  type="button"
                >
                  <img src={background.image} alt={background.label} />
                  <span>{background.label}</span>
                </button>
              )
            })}
          </div>

          <p className="disclaimer">
            "Only use under the guidance or support of your sports clinician or staff. Can start with 4
            cycles, and if tolerating this up to 8. If you experience any lightheadedness or side effects in
            tolerating this please stop using the program and notify your team leadership"
          </p>

          <div className="setupActions">
            <button className="secondaryButton" onClick={() => setScreen('home')}>
              Back
            </button>
            <button className="ctaButton" onClick={() => setScreen('program')}>
              Start Box Breathing
            </button>
          </div>
        </main>
      )}

      {screen === 'program' && (
        <main className="programMain" style={{ backgroundImage: `url(${selectedBackground.image})` }}>
          <div className="programOverlay">
            <h1>Box Breathing</h1>
            <p className="phaseText">{getBreathInstruction(secondsInCycle)}</p>

            <div className="graphContainer">
              <span className="cycleCounter">Cycles: {completedCycles}</span>
              <svg
                viewBox={`0 0 ${graph.width} ${graph.height}`}
                className="breathingGraph"
                role="img"
                aria-label="Box breathing graph"
              >
                <line
                  x1={graph.padding}
                  y1={graph.height - graph.padding}
                  x2={graph.width - graph.padding}
                  y2={graph.height - graph.padding}
                  className="axis"
                />
                <line
                  x1={graph.padding}
                  y1={graph.padding}
                  x2={graph.padding}
                  y2={graph.height - graph.padding}
                  className="axis"
                />
                <text x={graph.width - graph.padding + 10} y={graph.height - graph.padding + 5} className="axisLabel">
                  t
                </text>
                <text x={graph.padding - 10} y={graph.padding - 8} className="axisLabel">
                  +y
                </text>
                <text x={graph.padding - 20} y={graph.height - graph.padding + 5} className="axisLabel">
                  0
                </text>
                <polyline points={graphPoints} className="breathingLine" />
                <circle cx={ballPosition.x} cy={ballPosition.y} r="10" className="breathingBall" />
              </svg>
            </div>

            {!isPlaying && elapsedSeconds === 0 && (
              <button className="playOverlayButton" onClick={onPlay}>
                Play
              </button>
            )}

            <div className="controls">
              {isPlaying ? (
                <button className="secondaryButton" onClick={onPause}>
                  Pause
                </button>
              ) : (
                <button className="secondaryButton" onClick={onPlay}>
                  Play
                </button>
              )}
              <button className="secondaryButton" onClick={onReset}>
                Reset
              </button>
              <button className="secondaryButton" onClick={onBackToSelection}>
                Change Background
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  )
}

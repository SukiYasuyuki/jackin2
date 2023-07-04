import {
  useTexture,
  Sphere,
  CameraControls,
  PerspectiveCamera,
  useVideoTexture,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { button, useControls } from "leva";
import { Suspense, useRef } from "react";
import { useState } from "react";
import * as THREE from "three";
import useStore from "./store";
import { motion, AnimatePresence } from "framer-motion";
//import { Howl, Howler } from "howler";
import Snd from "snd-lib";
import { keyframes, styled } from "@stitches/react";
import { useEffect } from "react";
import useKeyPress from "./useKeyPress";

const snd = new Snd();
snd.load(Snd.KITS.SND01);

function Control() {
  const setAngle = useStore((state) => state.setAngle);

  return (
    <CameraControls
      enabled={true}
      makeDefault
      onChange={({ target }) => {
        setAngle({ azimuth: target.azimuthAngle, polaris: target.polarAngle });
      }}
      azimuthRotateSpeed={-0.2}
      polarRotateSpeed={-0.2}
      mouseButtons-wheel={0}
      mouseButtons-right={0}
      mouseButtons-middle={0}
      mouseButtons-shiftLeft={0}
      /*
      onStart={() => setDragging(true)}
      onEnd={() => setDragging(false)}
      */
    />
  );
}

function Camera() {
  const fov = useStore((state) => state.fov);
  return <PerspectiveCamera position={[0, 0, 0.001]} makeDefault fov={fov} />;
}

function Still({}) {
  /*
  const setCursor = useStore((state) => state.setCursor);
  */

  const addFov = useStore((state) => state.addFov);
  //const tex = useTexture("/still.jpg");
  const tex = useVideoTexture("/Eyewear3.mp4");

  return (
    <>
      <group rotation-y={-Math.PI / 2}>
        <Sphere
          args={[500, 64, 64]}
          scale={[-1, 1, 1]}
          /*
          onPointerMove={(e) => {
            setCursor(xyz2latlng(e.point));
            //cancel();
          }}
          onDoubleClick={(e) => {
            addFlag(xyz2latlng(e.point), myId);
          }}
                    */

          onWheel={(e) => addFov(e.wheelDelta * -0.01)}
        >
          <meshBasicMaterial
            toneMapped={false}
            side={THREE.BackSide}
            map={tex}
          />
        </Sphere>
      </group>
    </>
  );
}

function Capture() {
  const capture = useStore((state) => state.capture);
  const [speaking, setSpeaking] = useState("");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (window.webkitSpeechRecognition) {
      const WebkitSpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new WebkitSpeechRecognition();

      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "ja-JP";

      recognitionInstance.onresult = (event) => {
        let interimTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          setSpeaking(transcriptText);
          if (event.results[i].isFinal) {
            //setComment(transcriptText);
          } else {
            interimTranscript += transcriptText;
          }
        }
      };
      recognitionInstance.onend = () => {};
      setRecognition(recognitionInstance);
    } else {
      alert(
        "This browser does not support WebkitSpeechRecognition. Please try with a webkit-based browser like Google Chrome."
      );
    }
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (recognition) {
      if (capture) {
        recognition.start();
      } else {
        recognition.abort();
        setSpeaking("");
      }
    }
  }, [recognition, capture]);

  return (
    <AnimatePresence>
      {capture && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "clip",
            pointerEvents: "none",
          }}
        >
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.img
            src={capture.data}
            width={"100%"}
            height={"100%"}
            style={{
              position: "absolute",
              inset: 0,
            }}
            initial={{
              x: 0,
              y: 0,
              clipPath: `circle(0 at ${capture.x}px ${capture.y}px)`,
            }}
            animate={{
              x: 0,
              y: 0,
              clipPath: `circle(200px at ${capture.x}px ${capture.y}px)`,
            }}
            exit={{
              x: capture.width * 0.5 - capture.x,
              y: capture.height - 100 - capture.y,
              opacity: 0,
              clipPath: `circle(0 at ${capture.x}px ${capture.y}px)`,
            }}
          />
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              pointerEvents: "auto",
              fontSize: 40,
              fontWeight: "bold",
              left: capture.x,
              top: capture.y + 220,
              translate: "-50%",
            }}
            initial={{
              y: 0,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 100,
              opacity: 0,
              scale: 0,
            }}
          >
            {speaking === "" ? (
              <span style={{ opacity: 0.4 }}>音声入力できます</span>
            ) : (
              speaking
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

const scaleUp = keyframes({
  "0%": { scale: "0 1" },
  "100%": { scale: "1 1" },
});

const Bar = styled("div", {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: 4,
  background: "rgba(255, 255, 255, 0.4)",
  "&:after": {
    content: "",
    position: "absolute",
    inset: 0,
    background: "White",
    animation: `${scaleUp} 10000ms infinite linear`,
    transformOrigin: "left",
  },
});

const Input = styled("input", {
  all: "unset",
  background: "rgba(0,0,0, 0.25)",
  display: "block",
  height: 50,
  padding: "0 8px",
  "&::placeholder": {
    color: "rgba(255, 255, 255, 0.4)",
  },
  backdropFilter: "blur(20px)",
});

function CommentInput() {
  const [comment, setComment] = useState("");
  const timer = useRef();
  const setCapture = useStore((state) => state.setCapture);

  const finish = () => {
    setCapture(null);
    snd.play(Snd.SOUNDS.TRANSITION_DOWN);
  };
  useEffect(() => {
    timer.current = setTimeout(finish, 10000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <form
      style={{
        width: 320,
        //background: "red",
        marginBottom: 50,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        pointerEvents: "auto",
      }}
      onSubmit={(e) => {
        e.preventDefault();
        finish();
      }}
    >
      <Input
        type="text"
        placeholder="テキストを入力できます"
        onChange={(e) => {
          setComment(e.target.value);
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(finish, 10000);
        }}
        value={comment}
        autoFocus
      />

      <Bar key={comment} />
    </form>
  );
}

function Capture2() {
  const capture = useStore((state) => state.capture);
  const setCapture = useStore((state) => state.setCapture);

  return (
    <AnimatePresence>
      {capture && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "clip",
            pointerEvents: "none",
          }}
        >
          {/* <motion.div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          /> */}
          <motion.div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "clip",
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              pointerEvents: "none",
            }}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
          >
            <CommentInput />
          </motion.div>

          <motion.img
            src={capture.data}
            width={"100%"}
            height={"100%"}
            style={{
              position: "absolute",
              inset: 0,
              background: "red",
              outline: "2px solid white",
              boxShadow: "0 20px 100px rgba(0,0,0,0.5)",
              pointerEvents: "none",
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              filter: "brightness(200%)",
            }}
            animate={{
              x: 0,
              y:
                capture.height * 0.5 -
                100 -
                (0.5 * capture.height * 320) / capture.width,
              scale: 320 / capture.width,
              filter: "brightness(100%)",
              transition: {
                ease: "easeOut",
                duration: 0.8,
              },
            }}
            exit={{
              //x: capture.width * 0.5 - capture.x,
              y: capture.height * 0.5 - 100,
              scale: 0,
              opacity: 0,
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
}

function App() {
  const canvas = useRef();
  const setCapture = useStore((state) => state.setCapture);
  const circleCapture = useStore((state) => state.circleCapture);

  useKeyPress(" ", () => {
    if (!circleCapture) {
      const base64 = canvas.current.toDataURL("image/png");
      const rect = canvas.current.getClientRects();
      setCapture({
        data: base64,
        x: 400,
        y: 400,
        width: rect[0].width,
        height: rect[0].height,
      });
      snd.play(Snd.SOUNDS.TOGGLE_ON);
    }
  });

  const handleMouseDown = (event) => {
    const timeoutId = setTimeout(() => {
      const base64 = canvas.current.toDataURL("image/png");
      const rect = canvas.current.getClientRects();
      document.addEventListener("mouseup", finishLongPress);

      setCapture({
        data: base64,
        x: event.clientX,
        y: event.clientY,
        width: rect[0].width,
        height: rect[0].height,
      });
      if (circleCapture) {
        snd.play(Snd.SOUNDS.TRANSITION_UP);
      } else {
        snd.play(Snd.SOUNDS.TOGGLE_ON);
      }
    }, 250);
    const finishLongPress = () => {
      if (circleCapture) {
        setCapture(null);
        snd.play(Snd.SOUNDS.TRANSITION_DOWN);
        document.removeEventListener("mouseup", finishLongPress);
      }
    };

    const handleMouseUp = () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    const handleMouseMove = () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousemove", handleMouseMove);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        ref={canvas}
        onMouseDown={handleMouseDown}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense>
          <Still />
        </Suspense>
        <Control />
        <Camera />
      </Canvas>
      {circleCapture ? <Capture /> : <Capture2 />}

      <Switcher />
    </div>
  );
}

function Switcher() {
  const circleCapture = useStore((state) => state.circleCapture);
  const setCircleCapture = useStore((state) => state.setCircleCapture);

  return (
    <div
      style={{
        position: "absolute",
        top: 24,
        left: 24,
        display: "flex",
        borderRadius: 8,
        overflow: "clip",
      }}
    >
      <Item focused={circleCapture} onClick={() => setCircleCapture(true)}>
        A
      </Item>
      <Item focused={!circleCapture} onClick={() => setCircleCapture(false)}>
        B
      </Item>
    </div>
  );
}

const Item = styled("div", {
  padding: "8px 14px",
  background: "black",
  color: "#666",
  "&:hover": {
    cursor: "pointer",
  },
  variants: {
    focused: {
      true: {
        color: "white",
        background: "#333",
      },
    },
  },
});

export default App;

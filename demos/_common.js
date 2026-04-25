// Shared MediaPipe + camera setup for all demos
import { HandLandmarker, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';

export const HAND_CONNECTIONS = [
  [0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]
];

export function dist(a, b) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function thumbExtended(lm) {
  const palmWidth = dist(lm[5], lm[17]);
  return dist(lm[4], lm[5]) / palmWidth > 0.7;
}

export function fingersUp(lm) {
  const tips   = [4, 8, 12, 16, 20];
  const joints = [3, 6, 10, 14, 18];
  const up = [thumbExtended(lm)];
  for (let i = 1; i < 5; i++) up.push(lm[tips[i]].y < lm[joints[i]].y);
  return up;
}

export async function setupHandTracker(numHands = 1) {
  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
  );
  return await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
      delegate: 'GPU'
    },
    runningMode: 'VIDEO',
    numHands
  });
}

export async function setupCamera(video, facingMode = 'user') {
  if (video.srcObject) video.srcObject.getTracks().forEach(t => t.stop());
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
  });
  video.srcObject = stream;
  await new Promise(r => video.onloadedmetadata = r);
  return stream;
}

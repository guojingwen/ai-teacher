declare module 'mic-recorder-to-mp3';
declare interface Window {
  getUserMedia: any;
  _voiceOpened: boolean;
  needTokenFn: Function | null;
  needOpenVoice: Function | null;
}

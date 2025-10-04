declare module 'expo-av' {
  import { Component } from 'react';
  export namespace Audio {
    export type Sound = any;
    export const Sound: any;
    export const INTERRUPTION_MODE_IOS_DO_NOT_MIX: any;
    export const INTERRUPTION_MODE_ANDROID_DUCK_OTHERS: any;
    export function setAudioModeAsync(opts: any): Promise<void>;
    export function createAsync(...args: any[]): Promise<any>;
    export function SoundCreate(...args: any[]): Promise<any>;
  }
  export const Audio: any;
  export type AVPlaybackStatus = any;
  export default Audio;
}

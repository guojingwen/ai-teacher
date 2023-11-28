import { Message } from '@/types';

export async function arrayBufferToBase64(
  arrayBuffer: ArrayBuffer
): Promise<string> {
  return new Promise((resolve, reject) => {
    // 创建一个Blob对象
    let blob = new Blob([arrayBuffer], {
      type: 'application/octet-stream',
    });

    // 创建一个FileReader对象
    let reader = new FileReader();

    // 定义文件读取成功后的回调函数
    reader.onloadend = function () {
      // 获取Data URL
      let dataUrl = reader.result! as string;
      // 提取Base64字符串
      let base64 = dataUrl.split(',')[1];
      resolve('data:audio/wav;base64,' + base64);
    };

    // 定义文件读取失败的回调函数
    reader.onerror = function (error) {
      reject(error);
    };

    // 读取Blob对象
    reader.readAsDataURL(blob);
  });
}

export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

class AudioPlayImpl<T extends object = {}> {
  protected audioElement: HTMLAudioElement;
  protected addition: T | null = null;
  protected cb: Function | null = null;
  public constructor() {
    this.audioElement = new Audio();
    this.audioElement.addEventListener('ended', () => this.ended());
  }
  play(src: string, addition: T, cb: Function) {
    this.audioElement.src = src;
    this.addition = addition;
    this.cb = cb;
    this.audioElement.play();
  }
  private ended() {
    this.cb?.(this.addition);
    this.addition = null;
    this.cb = null;
  }
  stop() {
    this.audioElement.currentTime = 0;
    this.audioElement.pause();
    this.addition = null;
    this.cb = null;
  }
  getAddi(): T | null {
    return this.addition;
  }
}

export const audioInst = new AudioPlayImpl<
  Message & { index: number }
>();

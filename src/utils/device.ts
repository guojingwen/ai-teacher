const ua: string = navigator.userAgent;

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  isAndroid: ua.match(/.*Android\s([\d.]+)/),
  isIos: ua.match(/.*OS\s([\d_]+)/),
  isMobile: /Android|iPhone/i.test(ua),
  isSafari: /^((?!chrome|android).)*safari/i.test(ua),
};

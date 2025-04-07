
interface Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
  clarity?: (method: string, ...args: any[]) => void;
}

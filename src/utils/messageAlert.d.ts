export interface MessageAlertOptions {
    type?: 'success' | 'info' | 'error';
    message: string;
    duration?: number;
  }
  
  export declare function messageAlert(options: MessageAlertOptions): void;
  
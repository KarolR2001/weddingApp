declare module 'user-agent' {
    interface UserAgent {
      device: string;
      os: string;
      browser: string;
    }
  
    function parse(userAgent: string): UserAgent;
  
    export { parse };
  }
  
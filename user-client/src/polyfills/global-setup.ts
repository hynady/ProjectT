// Thiết lập global variable cho môi trường trình duyệt
// Script này sẽ chạy trước khi ứng dụng React được khởi tạo

// Tạo polyfill cho biến `global` trong môi trường trình duyệt
if (typeof window !== 'undefined' && !window.global) {
    window.global = window;
  }
  
  // Polyfill cho process.env nếu cần
  if (typeof window !== 'undefined' && !window.process) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.process = { env: {} } as any;
  }
  
  export {};
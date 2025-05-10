import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './qr-scanner.css';

interface HTMLQRScannerProps {
  onScan: (result: string) => void;
  width?: number;
  height?: number;
  className?: string;
}

export const HTMLQRScanner = ({
  onScan,
  width = 640,
  height = 480,
  className = '',
}: HTMLQRScannerProps) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState<boolean>(false);
  const [scannerCreated, setScannerCreated] = useState<boolean>(false);
  
  // We need to ensure the DOM element is created before initializing
  const scannerContainerId = "qr-reader";

  // Initialize scanner when component mounts
  useEffect(() => {
    // Wait for the DOM to be fully loaded
    const timer = setTimeout(() => {
      // Check if container element exists before initializing
      if (document.getElementById(scannerContainerId)) {
        try {
          // Create scanner instance
          scannerRef.current = new Html5Qrcode(scannerContainerId);
          setScannerCreated(true);
          console.log('Scanner created successfully');
          
          // Get available cameras 
          Html5Qrcode.getCameras()
            .then((devices) => {
              if (devices && devices.length > 0) {
                const cameraList = devices.map(device => ({
                  id: device.id,
                  label: device.label
                }));
                setCameras(cameraList);
                
                // Try to find a back camera
                const backCamera = cameraList.find(
                  camera => 
                    camera.label.toLowerCase().includes('back') || 
                    camera.label.toLowerCase().includes('rear') ||
                    camera.label.toLowerCase().includes('sau') ||
                    camera.label.toLowerCase().includes('chính')
                );
                
                // Use back camera if found, otherwise use the first one
                const defaultCamera = backCamera ? backCamera.id : cameraList[0].id;
                setCurrentCamera(defaultCamera);
              } else {
                setError('Không tìm thấy thiết bị camera');
              }
            })
            .catch((err) => {
              setError(`Không thể truy cập camera: ${err.message || 'Lỗi không xác định'}`);
              console.error('Error getting cameras', err);
            });
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
          setError(`Không thể khởi tạo máy quét: ${errMsg}`);
          console.error('Failed to create scanner', err);
        }
      } else {
        setError('Không tìm thấy phần tử scanner trong DOM');
        console.error('Scanner container element not found in DOM');
      }
    }, 1000); // Give DOM time to render
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current?.isScanning) {
            scannerRef.current.stop()
              .catch(err => console.error('Error stopping scanner', err));
          }
        } catch (e) {
          console.error('Error during cleanup', e);
        }
      }
    };
  }, []);

  // Start/stop scanning when camera changes
  useEffect(() => {
    if (!scannerRef.current || !currentCamera || !scannerCreated) {
      return;
    }

    const startScanner = async () => {
      // Stop any existing scan
      if (scannerRef.current?.isScanning) {
        try {
          await scannerRef.current.stop();
        } catch (err) {
          console.error('Error stopping scanner', err);
        }
      }

      // Configure scanner options
      const config = {
        fps: 10, // Lower frame rate for better performance
        qrbox: 250, // Fixed size instead of object
        aspectRatio: 1.0
      };

      try {
        // Start scanning
        setScanning(true);
        if (!scannerRef.current) {
          throw new Error('Scanner not initialized');
        }
        await scannerRef.current.start(
          { deviceId: currentCamera },
          config,
          (decodedText) => {
            console.log('QR Code found:', decodedText);
            onScan(decodedText);
          },
          (errorMessage) => {
            // We only care about true errors, not "no QR code found" notices
            if (!errorMessage.includes('No MultiFormat Readers') && 
                !errorMessage.includes('No barcode found')) {
              console.error('QR Scan error:', errorMessage);
            }
          }
        );
        console.log('Scanner started successfully with camera:', currentCamera);
      } catch (err) {
        console.error('Error starting scanner:', err);
        setError(`Không thể khởi động camera: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
        setScanning(false);
      }
    };

    // Start the scanner
    startScanner();

    // Cleanup this effect
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop()
          .catch(err => console.error('Error stopping scanner during cleanup', err));
      }
    };
  }, [currentCamera, scannerCreated, onScan]);

  // Switch camera function
  const switchCamera = () => {
    if (cameras.length <= 1) return;
    
    const currentIndex = cameras.findIndex(camera => camera.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCamera(cameras[nextIndex].id);
  };

  // Restart scanner function
  const restartScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
      
      setScanning(false);
      // Force camera refresh
      setTimeout(() => {
        if (currentCamera) {
          const sameCamera = currentCamera;
          setCurrentCamera(null);
          setTimeout(() => setCurrentCamera(sameCamera), 200);
        }
      }, 300);
    } catch (err) {
      console.error('Error restarting scanner', err);
    }
  };

  // Render visual scan guides
  const renderScanLines = () => {
    return (
      <div className="scan-target-lines">
        <div className="horizontal-line"></div>
        <div className="vertical-line"></div>
        <div className="corner top-left"></div>
        <div className="corner top-right"></div>
        <div className="corner bottom-left"></div>
        <div className="corner bottom-right"></div>
      </div>
    );
  };

  return (
    <div className={`html5-scanner ${className}`} style={{ width, height }}>
      {error ? (
        <div className="text-red-500 text-center p-4">
          <div className="font-semibold mb-2">Lỗi camera</div>
          <div>{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 rounded-md text-sm"
            type="button"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <div className="scanner-container relative" ref={containerRef}>
          {/* This is where the scanner will be mounted - must be present in DOM before scanner init */}
          <div id={scannerContainerId} style={{ width: '100%', height: '100%' }}></div>
          
          {renderScanLines()}
          
          <div className="scanner-controls">
            {cameras.length > 1 && (
              <button 
                onClick={switchCamera}
                className="camera-switch-btn"
                type="button"
                title="Đổi camera"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5l-3.5-3.5L9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z" />
                </svg>
              </button>
            )}
            
            <button 
              onClick={restartScanner}
              className="camera-switch-btn ml-2"
              type="button"
              title="Khởi động lại camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 9h7V2l-2.35 4.35z" />
              </svg>
            </button>
          </div>
          
          <div className="scanner-instructions">
            {scanning ? 'Đặt mã QR vào giữa khung hình' : 'Đang khởi động camera...'}
          </div>
        </div>
      )}
    </div>
  );
};

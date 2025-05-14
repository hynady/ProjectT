import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import './qr-scanner.css';

// Khai báo các thuộc tính toàn cục cần thiết cho scanner
declare global {
  interface Window {
    qrErrorRestartTimeout?: ReturnType<typeof setTimeout>;
    scannerInstance?: Html5Qrcode; // Add a global reference to scanner instance
  }
}

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
  const unmountingRef = useRef<boolean>(false);
  
  // We need to ensure the DOM element is created before initializing
  const scannerContainerId = "qr-reader";
  
  // Restart scanner function defined early to be used in other hooks
  const restartScanner = useCallback(async () => {
    // Check if component is unmounting or scanner is not initialized
    if (!scannerRef.current || unmountingRef.current) {
      console.log('Cannot restart scanner: component unmounting or scanner not initialized');
      return;
    }
    
    try {
      // First stop the scanner if it's running
      if (scannerRef.current.isScanning) {
        console.log('Stopping scanner before restart');
        await scannerRef.current.stop();
      }
      
      // Only update state if component is still mounted
      if (!unmountingRef.current) {
        setScanning(false);
      }
      
      // Only proceed with camera switching if component is still mounted
      if (currentCamera && !unmountingRef.current) {
        const sameCamera = currentCamera;
        
        // Set camera to null and wait a moment before restarting
        if (!unmountingRef.current) {
          setCurrentCamera(null);
        }
        
        // Use a promise-based delay instead of nested timeouts
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Double check component is still mounted before continuing
        if (!unmountingRef.current) {
          setCurrentCamera(sameCamera);
        }
      }
    } catch (err) {
      console.error('Error restarting scanner', err);
      
      // Force cleanup of any hanging media tracks as a fallback
      if (!unmountingRef.current) {
        document.querySelectorAll('video').forEach(video => {
          try {
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => {
                track.stop();
                console.log('Force stopped media track during restart error');
              });
              video.srcObject = null;
            }
          } catch (e) {
            console.error('Error cleaning video during restart error', e);
          }
        });
      }
    }
  }, [currentCamera]);
  
  // Initialize scanner when component mounts
  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true;
    unmountingRef.current = false;
    
    // Clean up any previously existing scanner instance from a prior render
    if (window.scannerInstance) {
      try {
        if (window.scannerInstance.isScanning) {
          console.log('Cleaning up existing global scanner instance');
          window.scannerInstance.stop()
            .then(() => {
              console.log('Previous scanner instance stopped successfully');
              window.scannerInstance = undefined;
            })
            .catch(err => console.error('Error stopping previous scanner instance', err));
        } else {
          window.scannerInstance = undefined;
        }
      } catch (e) {
        console.error('Error cleaning up previous scanner instance', e);
        window.scannerInstance = undefined;
      }
    }
    
    // Wait for the DOM to be fully loaded
    const timer = setTimeout(() => {
      // Check if component is still mounted and container element exists
      if (!isMounted || !document.getElementById(scannerContainerId)) {
        console.log('Scanner container not ready or component unmounted');
        return;
      }
      
      try {
        // Create scanner instance
        scannerRef.current = new Html5Qrcode(scannerContainerId);
        // Store a global reference for cleanup
        window.scannerInstance = scannerRef.current;
        
        if (isMounted) {
          setScannerCreated(true);
          console.log('Scanner created successfully');
        }
        
        // Get available cameras 
        Html5Qrcode.getCameras()
          .then((devices) => {
            if (!isMounted) return;
            
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
              
              if (!unmountingRef.current) {
                setCurrentCamera(defaultCamera);
              }
            } else {
              if (isMounted) {
                setError('Không tìm thấy thiết bị camera');
              }
            }
          })
          .catch((err) => {
            if (!isMounted) return;
            
            setError(`Không thể truy cập camera: ${err.message || 'Lỗi không xác định'}`);
            console.error('Error getting cameras', err);
          });
      } catch (err) {
        if (!isMounted) return;
        
        const errMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
        setError(`Không thể khởi tạo máy quét: ${errMsg}`);
        console.error('Failed to create scanner', err);
      }
    }, 1000); // Give DOM time to render
    
    // Cleanup on unmount
    return () => {
      // Mark component as unmounted
      isMounted = false;
      unmountingRef.current = true;
      console.log('HTMLQRScanner unmounting - cleaning up resources');
      clearTimeout(timer);
      
      if (window.qrErrorRestartTimeout) {
        clearTimeout(window.qrErrorRestartTimeout);
        window.qrErrorRestartTimeout = undefined;
      }
      
      if (scannerRef.current) {
        try {
          if (scannerRef.current?.isScanning) {
            console.log('Stopping scanner during component unmount');
            scannerRef.current.stop()
              .then(() => {
                console.log('Scanner stopped successfully during unmount');
                // Clear the scanner reference
                scannerRef.current = null;
                window.scannerInstance = undefined;
              })
              .catch(err => console.error('Error stopping scanner', err));
          }
          // Clear scanner even if not scanning
          else {
            scannerRef.current = null;
            window.scannerInstance = undefined;
          }
        } catch (e) {
          console.error('Error during cleanup', e);
        }
      }
      
      // Find and cleanup all video elements as a fallback
      document.querySelectorAll('video').forEach(video => {
        try {
          const stream = video.srcObject as MediaStream;
          if (stream) {
            stream.getTracks().forEach(track => {
              track.stop();
              console.log('Media track stopped during unmount');
            });
            video.srcObject = null;
          }
        } catch (err) {
          console.error('Error stopping video tracks during unmount:', err);
        }
      });
    };
  }, []);  
  
  // Start/stop scanning when camera changes
  useEffect(() => {
    // Don't do anything if conditions aren't right
    if (!scannerRef.current || !currentCamera || !scannerCreated || unmountingRef.current) {
      return;
    }

    // Small delay to ensure DOM is ready for scanner
    const timer = setTimeout(() => {
      const startScannerAsync = async () => {
        try {
          // Double-check refs and DOM elements
          if (!scannerRef.current || !document.getElementById(scannerContainerId) || unmountingRef.current) {
            console.log('Scanner or container not available or component unmounting');
            return;
          }
          
          // Stop any existing scan first
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
            console.log('Stopped existing scan before starting new one');
            // Small delay to ensure clean state transition
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Abort if component is unmounting during the delay
            if (unmountingRef.current) {
              console.log('Component unmounting during scanner restart - aborting');
              return;
            }
          }

          // Check if scanner container exists and has proper dimensions
          const scannerElement = document.getElementById(scannerContainerId);
          if (!scannerElement || scannerElement.clientWidth === 0) {
            console.error('Scanner container not ready or has no dimensions');
            if (!unmountingRef.current) {
              setError('Không thể khởi tạo camera. Vui lòng thử lại');
            }
            return;
          }
          
          // Configure scanner options
          const config = {
            fps: 10, 
            qrbox: 250,
            aspectRatio: 1.0
          };

          // Only update state if component is still mounted
          if (!unmountingRef.current) {
            setScanning(true);
            setError(null); // Clear any previous errors
          } else {
            console.log('Component unmounting before starting scanner - aborting');
            return;
          }
          
          // Start scanning
          await scannerRef.current.start(
            { deviceId: currentCamera },
            config,
            (decodedText) => {
              if (unmountingRef.current) return;
              console.log('QR Code found:', decodedText);
              onScan(decodedText);
            },
            (errorMessage) => {
              if (unmountingRef.current) return;
              
              // Skip logging for common non-critical errors
              if (errorMessage.includes('No MultiFormat Readers') || 
                  errorMessage.includes('No barcode found') ||
                  errorMessage.includes('source width is 0') ||
                  errorMessage.includes('The source width is 0') ||
                  errorMessage.includes('IndexSizeError') ||
                  errorMessage.includes('getImageData')) {
                return; // Don't log these common errors
              }
              
              console.error('QR Scan error:', errorMessage);
              
              // Auto-recovery for certain types of errors
              if ((errorMessage.includes('source width is 0') || 
                  errorMessage.includes('IndexSizeError')) && 
                  !window.qrErrorRestartTimeout && 
                  !unmountingRef.current) {
                
                window.qrErrorRestartTimeout = setTimeout(() => {
                  // Double check component is still mounted
                  if (!unmountingRef.current) {
                    console.log('Auto-restarting scanner after error');
                    restartScanner();
                  }
                  window.qrErrorRestartTimeout = undefined;
                }, 2000);
              }
            }
          );
          console.log('Scanner started successfully with camera:', currentCamera);
        } catch (err) {
          if (unmountingRef.current) return;
          
          console.error('Error starting scanner:', err);
          if (!unmountingRef.current) {
            setError(`Không thể khởi động camera: ${err instanceof Error ? err.message : 'Lỗi không xác định'}`);
            setScanning(false);
          }
          
          // Clean up any stray video tracks as a fallback
          document.querySelectorAll('video').forEach(video => {
            try {
              const stream = video.srcObject as MediaStream;
              if (stream) {
                stream.getTracks().forEach(track => {
                  track.stop();
                  console.log('Force stopped media track after start error');
                });
                video.srcObject = null;
              }
            } catch (e) {
              console.error('Error cleaning video during start error', e);
            }
          });
        }
      };

      // Start the scanner asynchronously
      startScannerAsync();
    }, 300);
    
    // Cleanup this effect
    return () => {
      clearTimeout(timer);
      
      if (scannerRef.current && scannerRef.current.isScanning) {
        console.log('Stopping scanner during camera change cleanup');
        
        scannerRef.current.stop()
          .then(() => console.log('Scanner stopped successfully during camera change'))
          .catch(err => console.error('Error stopping scanner during cleanup', err));
          
        // As a fallback, also directly stop any video tracks
        document.querySelectorAll('video').forEach(video => {
          try {
            const stream = video.srcObject as MediaStream;
            if (stream) {
              stream.getTracks().forEach(track => {
                track.stop();
                console.log('Media track stopped during camera change cleanup');
              });
              video.srcObject = null;
            }
          } catch (err) {
            console.error('Error stopping video tracks during camera change cleanup:', err);
          }
        });
      }
    };
  }, [currentCamera, scannerCreated, onScan, restartScanner]);

  // Switch camera function
  const switchCamera = () => {
    if (cameras.length <= 1) return;
    
    const currentIndex = cameras.findIndex(camera => camera.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    setCurrentCamera(cameras[nextIndex].id);
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

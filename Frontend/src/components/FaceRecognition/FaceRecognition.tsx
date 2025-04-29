import React, { useRef, useEffect, useState } from "react";
import "./FaceRecognition.css";

interface FaceRecognitionProps {
  userName: string;
  setUserName: (userName: string) => void;
  message: string;
  setMessage: (message: string) => void;
  annotatedImage: string;
  setAnnotatedImage: (annotatedImage: string) => void;
}

const FaceRecognitionCore: React.FC<FaceRecognitionProps> = ({
  userName,
  setUserName,
  message,
  setMessage,
  annotatedImage,
  setAnnotatedImage,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const collectingInterval = useRef<NodeJS.Timeout | null>(null);
  const recognizingInterval = useRef<NodeJS.Timeout | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [lastRecognizedName, setLastRecognizedName] = useState<string>("");
  const [collectingCount, setCollectingCount] = useState<number>(0);
  const [isCollecting, setIsCollecting] = useState<boolean>(false);
  const [isRecognizing, setIsRecognizing] = useState<boolean>(false);
  const [recognitionSuccessful, setRecognitionSuccessful] = useState<boolean>(false);
  const [totalImages, setTotalImages] = useState<number>(100);
  const [canTrain, setCanTrain] = useState<boolean>(false);

  const [userId, setUserId] = useState<number>();
  const [fullName, setFullName] = useState<string>('');
  const [userStatus, setUserStatus] = useState<string>('');

  useEffect(() => {
    let currentUserId: string = localStorage.getItem("user_id")!
    let userStatus: string = localStorage.getItem("status")!
    let userFullName: string = localStorage.getItem("fullname")!
    setUserId(parseInt(currentUserId))
    setUserStatus(userStatus)
    setFullName(userFullName)
  }, [])
  useEffect(() => {
    setUserName(fullName)
  }, [fullName])
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Không thể mở camera:", err);
        setMessage("Không thể mở camera. Vui lòng kiểm tra quyền truy cập camera!");
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setMessage]);

  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataURL = canvas.toDataURL("image/jpeg");
      return dataURL.replace(/^data:image\/\w+;base64,/, "");
    }
    return null;
  };

  const collectData = async () => {
    if (!userName) {
      setMessage("Vui lòng nhập tên trước khi quét!");
      stopAll();
      return;
    }
    const base64Str = captureFrame();
    if (!base64Str) return;

    try {
      const resp = await fetch("http://localhost:1748/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          imageBase64: base64Str,
        }),
      });
      const result = await resp.json();
      if (result.error) {
        setMessage("Lỗi: " + result.error);
        stopAll();
      } else {
        const savedCount = result.message.match(/Lưu (\d+) khuôn mặt/);
        if (savedCount && savedCount[1]) {
          setCollectingCount(prev => prev + parseInt(savedCount[1]));
        } else {
          setCollectingCount(prev => prev + 1);
        }
      }
    } catch (err) {
      console.error("Lỗi khi thu thập:", err);
      setMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối!");
      stopAll();
    }
  };

  useEffect(() => {
    if (isCollecting) {
      setMessage(`Đang quét: ${collectingCount}/${totalImages} ảnh cho ${userName}`);
      
      if (collectingCount >= totalImages) {
        if (collectingInterval.current) {
          clearInterval(collectingInterval.current);
          collectingInterval.current = null;
          setIsCollecting(false);
          setCanTrain(true);
          setMessage(`Đã thu thập đủ ${totalImages} ảnh cho ${userName}. Vui lòng nhấn "LƯU VÀ HUẤN LUYỆN" để tiếp tục.`);
        }
      }
    }
  }, [collectingCount, isCollecting, totalImages, userName]);

  const startCollecting = () => {
    if (collectingInterval.current) return;
    if (!userName.trim()) {
      setMessage("Vui lòng nhập tên trước khi quét!");
      return;
    }
    
    setCollectingCount(0);
    setIsCollecting(true);
    setIsRecognizing(false);
    setRecognitionSuccessful(false);
    setAnnotatedImage("");
    setCanTrain(false);
    
    collectingInterval.current = setInterval(() => {
      collectData();
      
      if (collectingCount >= totalImages) {
        clearInterval(collectingInterval.current!);
        collectingInterval.current = null;
        setIsCollecting(false);
        setCanTrain(true);
        setMessage(`Đã thu thập đủ ${totalImages} ảnh cho ${userName}. Vui lòng nhấn "LƯU VÀ HUẤN LUYỆN" để tiếp tục.`);
      }
    }, 200);
    
    setMessage("Đang quét khuôn mặt, vui lòng nhìn vào camera...");
  };

  const trainModel = async () => {
    setMessage("Đang huấn luyện mô hình nhận diện...");
    try {
      const resp = await fetch("http://localhost:1748/train");
      const result = await resp.json();
      if (result.error) {
        setMessage("Lỗi huấn luyện: " + result.error);
      } else {
        setMessage("Huấn luyện thành công! Giờ bạn có thể bắt đầu điểm danh.");
        setCanTrain(false);
      }
    } catch (err) {
      console.error("Lỗi khi huấn luyện:", err);
      setMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối!");
    }
  };

  const recognizeFace = async () => {
    const base64Str = captureFrame();
    if (!base64Str) return;

    try {
      const resp = await fetch("http://localhost:1748/recognize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Str }),
      });
      const result = await resp.json();
      if (result.error) {
        setMessage("Lỗi nhận diện: " + result.error);
        setRecognitionSuccessful(false);
      } else {
        if (result.recognized_name && result.recognized_name !== "Unknown") {
          setMessage(`Điểm danh thành công: ${result.recognized_name}`);
          setRecognitionSuccessful(true);
        } else {
          setMessage("Không nhận diện được khuôn mặt hoặc không tìm thấy trong hệ thống");
          setRecognitionSuccessful(false);
        }
        
        setTimestamp(result.timestamp || new Date().toLocaleString());
        setLastRecognizedName(result.recognized_name || "Unknown");
        
        if (result.annotated_image) {
          const fullDataUrl = "data:image/jpeg;base64," + result.annotated_image;
          setAnnotatedImage(fullDataUrl);
        }
      }
    } catch (err) {
      console.error("Lỗi khi nhận diện:", err);
      setMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối!");
      setRecognitionSuccessful(false);
    }
  };

  const startRecognizing = () => {
    if (recognizingInterval.current) return;
    
    setIsCollecting(false);
    setIsRecognizing(true);
    setAnnotatedImage("");
    
    recognizingInterval.current = setInterval(() => {
      recognizeFace();
    }, 1400);
    setMessage("Đang nhận diện khuôn mặt, vui lòng nhìn vào camera...");
  };

  const stopAll = async () => {
    if (collectingInterval.current) {
        clearInterval(collectingInterval.current);
        collectingInterval.current = null;
        setIsCollecting(false);
        
        if (collectingCount >= totalImages) {
          setCanTrain(true);
        }
    }
    if (recognizingInterval.current) {
        clearInterval(recognizingInterval.current);
        recognizingInterval.current = null;
        setIsRecognizing(false);

        if (annotatedImage && lastRecognizedName && lastRecognizedName !== "Unknown" && timestamp) {
            const base64Str = annotatedImage.replace(/^data:image\/\w+;base64,/, "");
            try {
                const resp = await fetch("http://localhost:1748/save-attendance", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        imageBase64: base64Str,
                        name: lastRecognizedName,
                        timestamp: timestamp,
                    }),
                });
                const result = await resp.json();
                if (result.error) {
                    setMessage("Lỗi lưu điểm danh: " + result.error);
                } else {
                    setMessage("Đã lưu ảnh điểm danh thành công!");
                }
            } catch (err) {
                console.error("Lỗi khi lưu điểm danh:", err);
                setMessage("Không thể lưu ảnh điểm danh!");
            }
        }
    }
    
    if (!collectingInterval.current && !recognizingInterval.current && !message.includes("thành công")) {
        setMessage("");
    }
};

  return (
    <div className="face-recognition-container">
      {/* Input Section */}
      <div className="input-card">
        <h2>ĐĂNG KÝ KHUÔN MẶT MỚI</h2>
        <div className="input-group">
          <label>Nhập tên nhân viên</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setUserName(fullName)}
            placeholder="Ví dụ: Nguyễn Văn A"
            disabled={userStatus === "register" ? false : true}
            className="name-input" 
          />
        </div>
        {
          userStatus === "register" ?
            <button 
              className={`start-scan-btn ${isCollecting ? 'active-btn' : ''}`} 
              onClick={startCollecting} 
              disabled={isRecognizing || collectingCount >= totalImages}
            >
              {isCollecting ? `ĐANG QUÉT (${collectingCount}/${totalImages})` : 'BẮT ĐẦU QUÉT'}
            </button>
          :
          ""
        }
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        {
          userStatus === "register" ?
            <button 
              className={`train-btn ${canTrain ? 'highlight-btn' : ''}`}
              onClick={trainModel} 
              disabled={isCollecting || isRecognizing || !canTrain}
            >
              LƯU VÀ HUẤN LUYỆN
            </button>
          :
          ""
        }
        <button 
          className={`recognize-btn ${isRecognizing ? 'active-btn' : ''}`}
          onClick={startRecognizing}
          disabled={isCollecting}
        >
          {isRecognizing ? 'ĐANG ĐIỂM DANH...' : 'BẮT ĐẦU ĐIỂM DANH'}
        </button>
        <button 
          className="stop-btn" 
          onClick={stopAll}
        >
          DỪNG
        </button>
      </div>

      {/* Video and Message Section */}
      <div className="media-grid">
        <div className="media-card">
          <h3>{isCollecting ? `THU THẬP ẢNH (${collectingCount}/${totalImages})` : isRecognizing ? 'ĐANG NHẬN DIỆN' : 'CAMERA'}</h3>
          {message && (
            <p className={
              message.includes("Lỗi") || message.includes("lỗi") || message.includes("Không") 
                ? "error-message" 
                : message.includes("thành công") || message.includes("Đã") || recognitionSuccessful
                  ? "success-message" 
                  : "info-message"
            }>
              {message}
            </p>
          )}
          <video
            ref={videoRef}
            autoPlay
            playsInline
          />
        </div>

        {/* Recognized Image Section */}
        {annotatedImage && (
          <div className="media-card">
            <h3>{recognitionSuccessful ? `ĐIỂM DANH: ${lastRecognizedName}` : 'KẾT QUẢ NHẬN DIỆN'}</h3>
            <img src={annotatedImage} alt="Khuôn mặt đã nhận diện" />
            {timestamp && <p className="timestamp">Thời gian: {timestamp}</p>}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {isCollecting && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${Math.min((collectingCount / totalImages) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="progress-text">{collectingCount} / {totalImages} ảnh</p>
        </div>
      )}
    </div>
  );
};

export default FaceRecognitionCore;
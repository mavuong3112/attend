
import cv2
import numpy as np

MODEL_PATH = "face_model.xml"
LABELS_FILE = "labels.txt"

# Load model
recognizer = cv2.face.LBPHFaceRecognizer_create()
recognizer.read(MODEL_PATH)

# Load thông tin nhãn
label_dict = {}
with open(LABELS_FILE, "r") as f:
    for line in f.readlines():
        label_id, name = line.strip().split(",")
        label_dict[int(label_id)] = name

# Khởi tạo nhận diện khuôn mặt
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(50, 50))

    for (x, y, w, h) in faces:
        face = gray[y:y+h, x:x+w]
        face_resized = cv2.resize(face, (200, 200))

        # Dự đoán danh tính
        label_id, confidence = recognizer.predict(face_resized)
        name = label_dict.get(label_id, "Không xác định")

        if confidence < 50:
            text = f"{name} (Điểm danh thành công)"
            color = (0, 255, 0)
        else:
            text = "Không xác định"
            color = (0, 0, 255)

        cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
        cv2.putText(frame, text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, color, 2)

    cv2.imshow("Recognition", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

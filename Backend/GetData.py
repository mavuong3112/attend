
import cv2
import os

# Thư mục lưu dataset
DATASET_PATH = "dataset"
if not os.path.exists(DATASET_PATH):
    os.makedirs(DATASET_PATH)

# Nhập tên người dùng để lưu dữ liệu
user_name = input("Nhập tên của nhân viên: ")
user_path = os.path.join(DATASET_PATH, user_name)

if not os.path.exists(user_path):
    os.makedirs(user_path)

# Khởi tạo nhận diện khuôn mặt
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# Mở webcam
cap = cv2.VideoCapture(0)

image_count = 0
max_images = 100  # Số lượng ảnh tối đa

while image_count < max_images:
    ret, frame = cap.read()
    if not ret:
        break

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5, minSize=(50, 50))

    for (x, y, w, h) in faces:
        face = frame[y:y+h, x:x+w]
        face_resized = cv2.resize(face, (200, 200))
        cv2.imwrite(f"{user_path}/{image_count}.jpg", face_resized)
        image_count += 1

        # Hiển thị quá trình chụp
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)

    cv2.imshow("Collecting Data", frame)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

print(f"Đã lưu {image_count} ảnh vào {user_path}")

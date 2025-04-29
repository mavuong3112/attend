import datetime
import os
import cv2
import base64
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy


from configs.db_config import DbConfig
# from models.user import User
# from models.attendance import Attendance

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Content-Type"]}})

app.config.from_object(DbConfig)

db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fullname = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    password = db.Column(db.String(100), nullable=False)
    is_face_scanned = db.Column(db.Boolean, nullable=False, default=False)

    attendances = db.relationship('Attendance', backref='user', lazy=True)

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    attendant_date = db.Column(db.DateTime)

with app.app_context():
    # Create tables if not already created
    db.create_all()


DATASET_PATH = "dataset"
MODEL_PATH = "face_model.xml"
LABELS_FILE = "labels.txt"
ATTENDANCE_PATH = "attendance"
if not os.path.exists(ATTENDANCE_PATH):
    os.makedirs(ATTENDANCE_PATH)
# Khởi tạo LBPH
recognizer = cv2.face.LBPHFaceRecognizer_create()
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def decode_base64_to_image(base64_str):
    """Giải mã base64 -> ảnh OpenCV (numpy array, BGR)."""
    img_bytes = base64.b64decode(base64_str)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return frame

@app.route('/collect', methods=['POST'])
def collect_data():
    """Thu thập ảnh (base64) & lưu vào dataset với tên (name)."""
    data = request.json
    name = data.get("name")
    base64_str = data.get("imageBase64")

    if not name or not base64_str:
        return jsonify({"error": "Thiếu name hoặc imageBase64"}), 400

    user_path = os.path.join(DATASET_PATH, name)
    os.makedirs(user_path, exist_ok=True)

    frame = decode_base64_to_image(base64_str)
    if frame is None:
        return jsonify({"error": "Ảnh không hợp lệ"}), 400

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(50, 50))

    count_saved = 0
    for (x, y, w, h) in faces:
        face_img = gray[y:y+h, x:x+w]
        face_resized = cv2.resize(face_img, (200, 200))
        # Lấy tên file = số thứ tự
        filename = f"{len(os.listdir(user_path))}.jpg"
        cv2.imwrite(os.path.join(user_path, filename), face_resized)
        count_saved += 1

    return jsonify({"message": f"Lưu {count_saved} khuôn mặt cho {name} thành công"})

@app.route('/train', methods=['GET'])
def train_model():
    """Duyệt dataset => huấn luyện => lưu model LBPH."""
    label_dict = {}
    faces = []
    labels = []

    for label_id, person_name in enumerate(os.listdir(DATASET_PATH)):
        person_path = os.path.join(DATASET_PATH, person_name)
        if not os.path.isdir(person_path):
            continue
        label_dict[label_id] = person_name

        for img_file in os.listdir(person_path):
            img_path = os.path.join(person_path, img_file)
            gray_img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
            if gray_img is None:
                continue
            faces.append(gray_img)
            labels.append(label_id)

    if not faces:
        return jsonify({"error": "Không có ảnh trong dataset"}), 400

    recognizer.train(faces, np.array(labels))
    recognizer.save(MODEL_PATH)

    # Lưu file labels
    with open(LABELS_FILE, "w", encoding="utf-8") as f:
        for lid, pname in label_dict.items():
            f.write(f"{lid},{pname}\n")

    return jsonify({"message": "Lưu nhân viên hoàn tất!", "model_path": MODEL_PATH})


@app.route('/register', methods=['POST'])
def register_user():
    fullname = request.json.get("fullname")
    email = request.json.get("email")
    password = request.json.get("password")

    new_user = User(fullname=fullname, email=email, password=password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "user_id": new_user.id,
        "fullname": new_user.fullname,
        "email": new_user.email,
        "is_face_scanned": new_user.is_face_scanned,
    }), 201

@app.route('/login', methods=['POST'])
def login_user():
    email = request.json.get("email")
    password = request.json.get("password")

    user = User.query.filter_by(email=email, password=password).first()

    if user:
        return jsonify({
            'user_id': user.id,
            'fullname': user.fullname,
            'email': user.email
        })
    else:
        return jsonify({'message': 'User not found'}), 404


@app.route('/recognize', methods=['POST'])
def recognize_face():
    data = request.json
    base64_str = data.get("imageBase64")
    if not base64_str:
        return jsonify({"error": "Thiếu imageBase64"}), 400

    frame = decode_base64_to_image(base64_str)
    if frame is None:
        return jsonify({"error": "Ảnh không hợp lệ"}), 400

    if not os.path.exists(MODEL_PATH) or not os.path.exists(LABELS_FILE):
        return jsonify({"error": "Chưa train model hoặc thiếu file model/labels"}), 400

    # Đọc model & label
    recognizer.read(MODEL_PATH)
    label_dict = {}
    with open(LABELS_FILE, "r", encoding="utf-8") as f:
        for line in f:
            lid, pname = line.strip().split(",")
            label_dict[int(lid)] = pname

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(50, 50))
    if len(faces) == 0:
        _, buf_no_face = cv2.imencode(".jpg", frame)
        annotated_no_face = base64.b64encode(buf_no_face).decode('utf-8')
        return jsonify({
            "annotated_image": annotated_no_face,
            "recognized_name": None,
            "confidence": 0,
            "message": "Không thấy khuôn mặt nào hết huhuhu"
        })

    # Get current timestamp
    current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Process the first face (as per your demo logic)
    (x, y, w, h) = faces[0]
    face_img = gray[y:y+h, x:x+w]
    face_resized = cv2.resize(face_img, (200, 200))

    label_id, confidence = recognizer.predict(face_resized)
    name = label_dict.get(label_id, "Khong xac dinh")

    if confidence < 50:
        show_name = name
        text = f"{name} "
    #     {int(confidence)}%
    else:
        show_name = "Unknown"
        text = "Khong xac dinh"

    # Draw bounding box + name
    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
    cv2.putText(
        frame, text, (x, y - 5),
        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2
    )

    # Add timestamp below the bounding box
    cv2.putText(
        frame, current_time, (x, y + h + 30),
        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
    )

    # Encode the annotated image to base64
    _, buf = cv2.imencode(".jpg", frame)
    annotated_base64 = base64.b64encode(buf).decode('utf-8')

    return jsonify({
        "annotated_image": annotated_base64,
        "recognized_name": show_name,
        "confidence": float(confidence),
        "message": f"Điểm danh thành công òi nhaa {show_name} iu ",
        "timestamp": current_time  # Optional: return timestamp in response
    })
@app.route('/save-attendance', methods=['POST'])
def save_attendance():
    """Lưu ảnh đã nhận diện vào thư mục attendance với tên nhân viên và timestamp."""
    data = request.json
    user_id = data.get("user_id")
    base64_str = data.get("imageBase64")
    name = data.get("name")
    timestamp = data.get("timestamp")  # Expect timestamp from frontend

    if not base64_str or not name or not timestamp:
        return jsonify({"error": "Thiếu imageBase64, name hoặc timestamp"}), 400

    # Decode the base64 image
    frame = decode_base64_to_image(base64_str)
    if frame is None:
        return jsonify({"error": "Ảnh không hợp lệ"}), 400

    # Save the image to the attendance folder
    filename = f"{name}_{timestamp.replace(' ', '_').replace(':', '-')}.jpg"
    save_path = os.path.join(ATTENDANCE_PATH, filename)
    cv2.imwrite(save_path, frame)

    attendance = Attendance(user_id=user_id, attendant_date=timestamp)

    db.session.add(attendance)
    db.session.commit()

    return jsonify({"message": f"Đã lưu ảnh điểm danh cho {name} vào {save_path}"})
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=1748)


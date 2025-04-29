
import cv2
import os
import numpy as np
from PIL import Image

DATASET_PATH = "dataset"
MODEL_PATH = "face_model.xml"

# Khởi tạo model LBPH (Local Binary Patterns Histograms)
recognizer = cv2.face.LBPHFaceRecognizer_create()

def get_images_and_labels(dataset_path):
    image_paths = []
    labels = []
    label_dict = {}

    # Duyệt qua thư mục dataset
    for label_id, person_name in enumerate(os.listdir(dataset_path)):
        person_path = os.path.join(dataset_path, person_name)
        if not os.path.isdir(person_path):
            continue

        label_dict[label_id] = person_name  # Lưu nhãn ứng với tên

        for image_name in os.listdir(person_path):
            image_path = os.path.join(person_path, image_name)
            image = Image.open(image_path).convert('L')  # Chuyển sang ảnh xám
            image_np = np.array(image, dtype=np.uint8)

            image_paths.append(image_np)
            labels.append(label_id)

    return image_paths, np.array(labels), label_dict

print("Đang huấn luyện mô hình...")
faces, labels, label_dict = get_images_and_labels(DATASET_PATH)

recognizer.train(faces, labels)
recognizer.save(MODEL_PATH)

# Lưu thông tin nhãn vào file
with open("labels.txt", "w") as f:
    for label_id, name in label_dict.items():
        f.write(f"{label_id},{name}\n")

print(f"Huấn luyện hoàn tất! Mô hình được lưu tại {MODEL_PATH}")

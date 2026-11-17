import cv2
import json
import numpy as np

# قراءة الصورة بالأبيض والأسود
image_path = "image.jpg"
img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)

if img is None:
    print("خطأ: لم يتم العثور على الصورة!")
else:
    # زيادة الدقة وتكبير الحجم لالتقاط تفاصيل الوجه بدقة عالية
    img = cv2.resize(img, (300, 300))

    # عتبة لتحديد النقاط بوضوح
    _, thresh = cv2.threshold(img, 120, 255, cv2.THRESH_BINARY)

    # استخراج إحداثيات البكسلات البيضاء
    points = np.column_stack(np.where(thresh > 0))

    # تصدير الإحداثيات
    points_list = [{"x": int(p[1]), "y": int(p[0])} for p in points]

    with open("points.json", "w") as f:
        json.dump(points_list, f)

    print(f"تم استخراج {len(points_list)} نقطة بدقة عالية وحفظها بنجاح!")
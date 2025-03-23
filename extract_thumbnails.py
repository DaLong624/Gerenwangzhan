import cv2
import os

def create_thumbnail(video_path, output_path, size=(640, 360)):
    # 打开视频文件
    cap = cv2.VideoCapture(video_path)
    
    # 读取第30帧（大约1秒）
    cap.set(cv2.CAP_PROP_POS_FRAMES, 30)
    ret, frame = cap.read()
    
    if ret:
        # 调整大小
        thumbnail = cv2.resize(frame, size)
        # 保存缩略图
        cv2.imwrite(output_path, thumbnail)
        print(f"已生成缩略图: {output_path}")
    else:
        print(f"无法处理视频: {video_path}")
    
    # 释放资源
    cap.release()

def main():
    # 创建输出目录
    if not os.path.exists("thumbnails"):
        os.makedirs("thumbnails")
    
    # 处理所有MP4文件
    for filename in os.listdir("Mp4"):
        if filename.endswith(".mp4"):
            video_path = os.path.join("Mp4", filename)
            output_path = os.path.join("thumbnails", f"{os.path.splitext(filename)[0]}.jpg")
            create_thumbnail(video_path, output_path)

if __name__ == "__main__":
    main() 
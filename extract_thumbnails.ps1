# 设置输入和输出目录
$inputDir = "Mp4"
$outputDir = "thumbnails"

# 确保输出目录存在
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}

# 获取所有 MP4 文件
$videos = Get-ChildItem -Path $inputDir -Filter "*.mp4" | Where-Object { $_.Name -ne "debug.log" }

foreach ($video in $videos) {
    Write-Host "正在处理视频：" $video.Name
    
    # 构建输出文件名（去掉 .mp4 扩展名，添加 .jpg）
    $outputFile = Join-Path $outputDir ($video.BaseName + ".jpg")
    
    # 使用 FFmpeg 从视频的第1秒提取一帧作为缩略图
    # -ss 1: 跳到视频的第1秒
    # -vframes 1: 只提取1帧
    # -q:v 2: 设置较高的图片质量（范围2-31，2为最好）
    # -vf "scale=640:360": 将图片缩放到 640x360，保持16:9比例
    ffmpeg -ss 1 -i $video.FullName -vframes 1 -q:v 2 -vf "scale=640:360" $outputFile
    
    Write-Host "已为 $($video.Name) 创建缩略图：$outputFile"
} 
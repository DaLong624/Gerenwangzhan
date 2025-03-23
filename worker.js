addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // 设置CORS头，允许所有来源访问
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }

  // 处理OPTIONS请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  try {
    // 获取请求的文件名
    const url = new URL(request.url)
    const fileName = decodeURIComponent(url.pathname.slice(1))

    // 如果是缩略图请求
    if (fileName.startsWith('thumbnails/')) {
      const thumbnailFile = await MY_BUCKET.get(fileName)
      if (thumbnailFile === null) {
        return new Response('Thumbnail not found', { status: 404 })
      }
      
      // 设置缓存和优化头
      const headers = {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Accept-Ranges': 'bytes',
      }
      
      return new Response(thumbnailFile.body, { headers })
    }

    // 如果是视频请求
    if (fileName.startsWith('Mp4/')) {
      const file = await MY_BUCKET.get(fileName)
      if (file === null) {
        return new Response('Video not found', { status: 404 })
      }

      // 获取视频的大小
      const size = file.size
      
      // 处理范围请求
      const range = request.headers.get('range')
      if (range) {
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : size - 1
        
        // 设置响应头
        const headers = {
          ...corsHeaders,
          'Content-Type': 'video/mp4',
          'Content-Range': `bytes ${start}-${end}/${size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': end - start + 1,
          'Cache-Control': 'public, max-age=31536000',
        }
        
        return new Response(file.slice(start, end + 1), {
          status: 206,
          headers
        })
      }
      
      // 非范围请求，返回完整视频
      const headers = {
        ...corsHeaders,
        'Content-Type': 'video/mp4',
        'Content-Length': size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000',
      }
      
      return new Response(file.body, { headers })
    }

    return new Response('Not found', { status: 404 })
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 500 })
  }
} 
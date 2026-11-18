-- Allow short product videos in the product media bucket.
-- Existing image policies already cover uploads by staff and public reads.
update storage.buckets
set file_size_limit = 26214400,
    allowed_mime_types = array[
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ]
where id = 'product-images';

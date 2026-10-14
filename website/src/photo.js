// Keep uploads comfortably below the Vercel request limit. The server validates
// and re-encodes them again before storing them in the private bucket.
export async function preparePhoto(file) {
  if (!file) return null;
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch {
    throw new Error('This photo could not be opened. Choose another JPG, PNG or WebP.');
  }
  try {
    const ratio = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the photo. Try sending without a photo.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    let encoded;
    for (const quality of [.84, .7, .55]) {
      encoded = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
      if (encoded && encoded.size <= 1024 * 1024) break;
    }
    if (!encoded || encoded.size > 1024 * 1024) throw new Error('This photo is too detailed to send. Please choose a smaller photo.');
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = () => reject(new Error('The photo could not be prepared. Please try another photo.'));
      reader.readAsDataURL(encoded);
    });
    return { type: 'image/jpeg', data };
  } finally { bitmap.close(); }
}

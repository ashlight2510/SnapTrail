import heic2any from 'heic2any';

/**
 * HEIC 파일을 JPEG로 변환
 * @param {File} file - HEIC 파일
 * @returns {Promise<File>} - 변환된 JPEG 파일
 */
export async function convertHeicToJpeg(file) {
  try {
    // HEIC 파일인지 확인
    const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                   file.name.toLowerCase().endsWith('.heif') ||
                   file.type === 'image/heic' ||
                   file.type === 'image/heif';
    
    if (!isHeic) {
      // HEIC가 아니면 원본 파일 반환
      return file;
    }
    
    console.log(`HEIC 파일 변환 중: ${file.name}`);
    
    // heic2any로 변환 (JPEG 형식으로)
    const convertedBlob = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.92
    });
    
    // heic2any는 배열을 반환할 수 있음 (여러 이미지인 경우)
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
    
    // Blob을 File 객체로 변환
    const jpegFile = new File(
      [blob],
      file.name.replace(/\.(heic|heif)$/i, '.jpg'),
      {
        type: 'image/jpeg',
        lastModified: file.lastModified
      }
    );
    
    console.log(`HEIC 변환 완료: ${file.name} -> ${jpegFile.name}`);
    return jpegFile;
  } catch (error) {
    console.error(`HEIC 변환 실패: ${file.name}`, error);
    // 변환 실패 시 원본 파일 반환 (또는 에러 처리)
    throw new Error(`HEIC 파일 변환 실패: ${error.message}`);
  }
}

/**
 * 여러 파일 중 HEIC 파일을 변환
 * @param {File[]} files - 파일 배열
 * @returns {Promise<Array<{original: File, converted: File}>>} - 원본과 변환된 파일 쌍 배열
 */
export async function convertHeicFiles(files) {
  const convertedFiles = [];
  
  for (const file of files) {
    try {
      const isHeic = file.name.toLowerCase().endsWith('.heic') || 
                     file.name.toLowerCase().endsWith('.heif') ||
                     file.type === 'image/heic' ||
                     file.type === 'image/heif';
      
      if (isHeic) {
        const converted = await convertHeicToJpeg(file);
        convertedFiles.push({ original: file, converted });
      } else {
        // HEIC가 아니면 원본만 반환
        convertedFiles.push({ original: file, converted: file });
      }
    } catch (error) {
      console.warn(`파일 건너뜀: ${file.name}`, error);
      // 변환 실패한 파일은 원본만 사용
      convertedFiles.push({ original: file, converted: file });
    }
  }
  
  return convertedFiles;
}


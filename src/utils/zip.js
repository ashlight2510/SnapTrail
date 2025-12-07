import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadZip(folderName, photos) {
  const zip = new JSZip();
  const folder = zip.folder(folderName);
  
  for (const p of photos) {
    try {
      // 썸네일 URL에서 이미지 가져오기
      let blob;
      if (p.thumbnail && p.thumbnail.startsWith('data:')) {
        // Data URL인 경우
        const response = await fetch(p.thumbnail);
        blob = await response.blob();
      } else if (p.previewUrl) {
        // Object URL인 경우
        blob = await fetch(p.previewUrl).then(res => res.blob());
      } else {
        console.warn('이미지 URL을 찾을 수 없음:', p.name);
        continue;
      }
      
      folder.file(p.file.name || p.name, blob);
    } catch (e) {
      console.error(`파일 추가 실패: ${p.file?.name || p.name}`, e);
    }
  }
  
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, `${folderName}.zip`);
  console.log(`ZIP 다운로드 완료: ${folderName}.zip`);
}


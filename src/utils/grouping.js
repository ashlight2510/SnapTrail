export function groupPhotosByDate(photoList) {
  const map = {};
  
  photoList.forEach((item) => {
    const d = item.dateParsed;
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    
    if (!map[year]) map[year] = {};
    if (!map[year][month]) map[year][month] = [];
    
    map[year][month].push(item);
  });
  
  return map;
}


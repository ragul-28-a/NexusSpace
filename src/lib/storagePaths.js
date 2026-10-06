export const getProjectAssetPath = (fileUrl) => {
  if (!fileUrl) return null;
  if (!/^https?:\/\//i.test(fileUrl)) return fileUrl;

  const markers = [
    '/storage/v1/object/public/project-assets/',
    '/storage/v1/object/sign/project-assets/'
  ];

  for (const marker of markers) {
    const markerIndex = fileUrl.indexOf(marker);
    if (markerIndex !== -1) {
      return decodeURIComponent(fileUrl.slice(markerIndex + marker.length).split('?')[0]);
    }
  }

  return null;
};

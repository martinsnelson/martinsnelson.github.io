async function uploadFile(file) {
  return new Promise((resolve, reject) => {
    const storageRef = storage.ref("uploads/" + Date.now() + "_" + file.name);
    const uploadTask = storageRef.put(file);

    uploadTask.on("state_changed",
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.getElementById("uploadProgress").value = progress;
      },
      error => reject(error),
      () => {
        uploadTask.snapshot.ref.getDownloadURL().then(resolve);
      }
    );
  });
}

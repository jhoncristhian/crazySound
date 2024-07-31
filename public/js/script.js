document
  .getElementById("download-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    const url = document.getElementById("url").value;

    try {
      const downloadResponse = await fetch(
        `/download?url=${encodeURIComponent(url)}`
      );
      const videoNameResponse = await fetch(
        `/nameVideo?url=${encodeURIComponent(url)}`
      );

      if (!downloadResponse.ok) {
        throw new Error("Failed to download");
      }

      if (!videoNameResponse.ok) {
        throw new Error("Failed to fetch video name");
      }

      const blob = await downloadResponse.blob();
      const videoName = await videoNameResponse.json();

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `${videoName.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error(error);
      alert("Error downloading audio");
    }
  });

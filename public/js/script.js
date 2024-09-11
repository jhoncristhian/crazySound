document
  .getElementById("download-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const url = document.getElementById("url").value;
    const convertButton = document.getElementById("convert-button");
    const loadingSpinner = document.getElementById("loading");
    const downloadButton = document.getElementById("download-button");

    // Ocultar el botón de convertir y mostrar el círculo de carga
    convertButton.style.display = "none";
    loadingSpinner.style.display = "block";

    try {
      // Enviar la solicitud para generar el archivo en el servidor
      const downloadResponse = await fetch(
        `/save2?url=${encodeURIComponent(url)}`
      );

      if (!downloadResponse.ok) {
        throw new Error("Failed to generate audio file");
      }

      // Obtener el JSON de la respuesta que contiene la URL de descarga
      const responseData = await downloadResponse.json();

      if (responseData.success) {
        const downloadUrl = responseData.name; // URL relativa devuelta por el servidor

        // Mostrar el botón de descarga y ocultar el círculo de carga
        loadingSpinner.style.display = "none";
        downloadButton.style.display = "block";

        // Configurar la acción del botón de descarga
        downloadButton.onclick = function () {
          const a = document.createElement("a");
          a.href = downloadUrl; // Usar la URL proporcionada por el servidor
          a.download = `${downloadUrl.split("/").pop()}`; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Recargar la página después de descargar
          window.location.reload();
        };
      } else {
        throw new Error(responseData.message || "Failed to download audio");
      }
    } catch (error) {
      console.error(error);
      alert("Error downloading audio");

      // Volver a mostrar el botón de convertir en caso de error
      convertButton.style.display = "block";
      loadingSpinner.style.display = "none";
    }
  });

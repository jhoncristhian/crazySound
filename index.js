const express = require("express");
const ytdl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 3000;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));

app.get("/nameVideo", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send("No se proporcionó una URL de video.");
  }

  try {
    const info = await ytdl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
    });

    const videoTitle = info.title;
    res.json({ title: videoTitle });
  } catch (err) {
    console.error("Error al obtener el nombre del video:", err);
    res.status(500).send("Error al obtener el nombre del video.");
  }
});

app.get("/download", async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).send("No se proporcionó una URL de video.");
  }

  let date = new Date();
  let dateString = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}${String(date.getDate()).padStart(2, "0")}${String(
    date.getHours()
  ).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}`;
  const outputFilePath = path.resolve(__dirname, dateString + ".mp3");

  try {
    await ytdl(videoUrl, {
      output: outputFilePath,
      extractAudio: true,
      audioFormat: "mp3",
    });

    if (fs.existsSync(outputFilePath)) {
      res.download(outputFilePath, "video.mp3", (err) => {
        if (err) {
          console.error("Error al enviar el archivo:", err);
          res.status(500).send("Error al enviar el archivo.");
        }
        // Elimina el archivo después de enviarlo
        fs.unlinkSync(outputFilePath);
      });
    } else {
      res.status(500).send("1 Error al descargar o convertir el video.");
    }
  } catch (err) {
    console.error("Error al descargar o convertir el video:", err);
    res.status(500).send("2 Error al descargar o convertir el video.");
  }
});

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

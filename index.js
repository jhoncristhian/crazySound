const express = require("express");
const ytdl = require("youtube-dl-exec");
const path = require("path");
const fs = require("fs");
// const { exec } = require("child_process");

const app = express();
const port = 3002;

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, "public")));
app.get("/music/:filename", (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, "music", fileName);

  // Establecer el encabezado Content-Disposition para forzar la descarga
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error al descargar el archivo:", err);
      res.status(404).send("Archivo no encontrado");
    }
  });
});

const folderPath = "./music";
let deleteTimeout;

const deleteFolderContents = (folderPath) => {
  fs.readdir(folderPath, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      fs.unlink(filePath, (err) => {
        if (err) throw err;
      });
    }
    console.log(
      `Todos los archivos en la carpeta ${folderPath} han sido eliminados.`
    );
  });
};

app.get("/save2", async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    return res.status(400).json({
      message: "No se proporcionó una URL de video.",
      success: false,
      statusCode: 400,
    });
  }

  let nameString = await nameSong(videoUrl);
  console.log("NAME:: " + nameString);
  // Guardar el archivo en la carpeta "music"
  const outputFilePath = path.join(__dirname, "music", `${nameString}.m4a`);

  try {
    // Crear la carpeta "music" si no existe
    const musicDir = path.join(__dirname, "music");
    if (!fs.existsSync(musicDir)) {
      fs.mkdirSync(musicDir);
    }

    // Ejecutar youtube-dl-exec para descargar solo el audio y guardarlo como mp3
    await ytdl(videoUrl, {
      extractAudio: true,
      audioFormat: "m4a",
      output: outputFilePath, // Guardar directamente en la ruta especificada
    });
    resetDeleteTimer(folderPath);
    return res.json({
      message: "El archivo de audio ha sido generado con éxito.",
      success: true,
      name: `/music/${nameString}.m4a`,
      statusCode: 200,
    });
  } catch (err) {
    console.error("Error inesperado:", err);
    return res.status(500).json({
      message: "Hubo un error inesperado.",
      success: false,
      statusCode: 500,
    });
  }
});

// app.get("/checkPython", (req, res) => {
//   // Ejecuta el comando para obtener la versión de Python
//   exec("python --version", (error, stdout, stderr) => {
//     if (error) {
//       console.error(`Error ejecutando el comando: ${error}`);
//       return res.status(500).json({
//         message:
//           "Python no está instalado o no es accesible desde el servidor.",
//         success: false,
//         statusCode: 500,
//       });
//     }

//     // Si Python está instalado, muestra la versión
//     const pythonVersion = stderr || stdout; // Python muestra su versión en stderr a veces
//     res.json({
//       message: `Python está instalado. Versión: ${pythonVersion.trim()}`,
//       success: true,
//       statusCode: 200,
//     });
//   });
// });

app.get("/helloworld", (req, res) => {
  res.json({
    message: "Hello, World!'",
    success: true,
    statusCode: 200,
  });
});

let nameSong = async (videoUrl) => {
  try {
    const info = await ytdl(videoUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
    });

    // Obtener el título del video
    let title = info.title;

    // Limpiar el título: solo permitir guiones, paréntesis y reemplazar espacios por guiones bajos
    title = title
      .replace(/[^\w\s()-]/g, "") // Eliminar caracteres no permitidos excepto letras, números, guiones, paréntesis
      .replace(/\s+/g, "_") // Reemplazar espacios por guiones bajos
      .trim(); // Eliminar espacios al principio y al final

    return title;
  } catch (err) {
    console.error("Error al obtener el nombre del video:", err);
    throw err;
  }
};

// Función para reiniciar el temporizador
const resetDeleteTimer = (folderPath) => {
  if (deleteTimeout) {
    clearTimeout(deleteTimeout); // Cancelar cualquier temporizador previo
  }

  // Establecer un nuevo temporizador para borrar la carpeta después de 15 minutos
  deleteTimeout = setTimeout(() => {
    deleteFolderContents(folderPath);
  }, 1 * 60 * 1000); // 15 minutos
};

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

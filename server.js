import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {filterImageFromURL, deleteLocalFiles} from './util/util.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure tmp directory exists
const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir);
}



  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8080;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // Endpoint to filter an image from a public URL.
  app.get("/filteredimage", async (req, res) => {
    const { image_url } = req.query;

    // 1. Validate the image_url query parameter
    if (!image_url) {
      return res.status(400).send({ message: "image_url query parameter is required." });
    }

    // Validate that the URL is a proper URL
    try {
      new URL(image_url);
    } catch (e) {
      return res.status(400).send({ message: "image_url must be a valid URL." });
    }

    // 2. Call filterImageFromURL to filter the image
    try {
      const filteredpath = await filterImageFromURL(image_url);

      // 3. Send the resulting file in the response
      res.sendFile(filteredpath, () => {
        // 4. Delete any files on the server on finish of the response
        deleteLocalFiles([filteredpath]);
      });
    } catch (error) {
      // Log the actual error for debugging
      console.error("FilterImage Error:", error);
      // Handle cases where the URL doesn't point to a valid image
      return res.status(422).send({ message: "Unable to process the image. Ensure the URL points to a valid, publicly accessible image file." });
    }
  });
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );

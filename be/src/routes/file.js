const router = require("express").Router();
const multer = require('multer');
const File = require('../models/file')
const path = require('path')

// Configure Multer to store files on the disk
const storage = multer.diskStorage({
  // Specify the destination directory for uploaded files
  destination: (req, file, cb) => {
    cb(null, 'assets/files/'); // The `uploads/` directory must exist
  },
  // Define the filename for the uploaded files
  filename: (req, file, cb) => {
    // We add a timestamp to the original filename to prevent collisions
    cb(null, Date.now() + '-' + file.originalname);
  },
});



// Initialize the multer middleware with the configured storage
const upload = multer({ storage: storage });

// Define a POST endpoint for multiple file uploads
// `upload.array('files', 10)` handles multiple files.
// The name 'files' must match the field name used in the React FormData object.
// The optional second argument (10) sets the maximum number of files.
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const channelId = req.body;
  const file = req.files[0]
  const newFile = await new File({ ...file, channel: channelId.channel })
  const result = await newFile.save();

  // If successful, req.files will contain an array of file objects
  res.status(200).json(result._id);
});

router.get('/', async (req, res) => {
  try {
    console.log(req.query)
    // Asynchronously find the file in the database
    const file = await File.findById(req.query.id);

    if (!file) {
      return res.status(404).send('File not found.');
    }
    const dir = path.dirname('E:/Project/Slack/manga_SlackProject/be/src');
    const filePath = path.join(dir, file.path);
    const originalName = file.originalname;

    console.log(filePath)
    // The res.download() method is synchronous once called,
    // but the logic leading up to it is now async.
    res.download(filePath, originalName, (err) => {
      if (err) {
        console.error('Download error:', err);
        // Ensure headers are not already sent
        if (!res.headersSent) {
          res.status(500).send('Could not download the file.');
        }
      }
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).send('Internal server error.');
  }
});

module.exports = router;




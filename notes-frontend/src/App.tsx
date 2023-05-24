import React, { useEffect, useState } from 'react';
import { Alert, AlertColor, AppBar, Box, createTheme, CssBaseline, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, IconButton, Snackbar, ThemeProvider, Toolbar, Typography, useMediaQuery } from '@mui/material';
import TextField from '@mui/material/TextField';
import NoteService from './services/NoteService';

import './App.css';
import Button from '@mui/material/Button';
import { Close } from '@mui/icons-material';
import { CirclePicker, ColorResult } from 'react-color';

interface SaveNoteProps {
  saveNewNote: (title: string, body: string, color: string) => Promise<boolean>;
}

interface ListNotesProps {
  savedNotes: Note[];
  openNote: (id: string) => void;
}

interface ViewNoteProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  note: Note;
  openEditNote: () => void;
  deleteNote: (id: string) => void;
}

interface EditNoteProps {
  open: boolean;
  setOpen: (arg0: boolean) => void;
  note: Note;
  editNote: (id: string, title: string, body: string, color: string) => void;
}

interface Note {
  id: string,
  title: string,
  body: string,
  color: string,
  updated: string,
}

const TITLE_LENGTH = 120;
const COLORS = ["#ef9a9a", 
    "#f48fb1", 
    "#ce93d8", 
    "#b39ddb", 
    "#9fa8da", 
    "#90caf9", 
    "#81d4fa", 
    "#80deea", 
    "#80cbc4", 
    "#a5d6a7",
    "#c5e1a5",
    "#e6ee9c",
    "#fff59d",
    "#ffe082",
    "#ffcc80",
    "#ffab91",
    "#bcaaa4",
    "#eeeeee",
    "#b0bec5",
  ];
const DEFAULT_COLOR = "#90caf9";

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'dark', // force dark theme since the colors look better on a dark interface
        },
      }),
    [prefersDarkMode],
  );

  // Will retrieve notes at first run
  let [notes, setNotes] = useState<Note[]>([]);

  // Will update the saved notes from the database every render when necessary
  useEffect(() => {
    retrieveNotes();
  })

  const retrieveNotes = () => {
    NoteService.getAll()
      .then(response => {
        if (response.status === 200) {
          setNotes(response.data);
          console.log(response.data);
        } else {
          showSnack("warning", "A server error has occurred.");
        }
      })
      .catch(e => {
        console.log(e);
        showSnack("warning", "A server error has occurred.");
      })
  }

  // Function that saves a new note
  const saveNewNote = async (title: string, body: string, color: string) => {
    if (title.trim().length === 0 || body.trim().length === 0) {
      return false; // no need to continue
    }

    let data = {
      title: title,
      body: body,
      color: color
    };

    try {
      const response = await NoteService.create(data);
      if (response.status === 200) {
        retrieveNotes(); // update notes
        showSnack("success", "Note saved!");
        return true;
      } else {
        showSnack("warning", "A server error has occurred.");
        return false;
      }
    } catch (e) {
      console.log(e);
      showSnack("warning", "A server error has occurred.");
      return false;
    }
  };

  // The component opening the modal needs to keep track of the modal's state
  let [dialogOpen, setDialogOpen] = useState(false);
  let [dialogNote, setDialogNote] = useState<Note>({
    id: '', title: '', body: '', color: '', updated: ''
  });

  const openNote = (id: string) => {
    NoteService.get(id)
      .then(response => {
        if (response.status === 200) {
          setDialogNote(response.data)
          setDialogOpen(true) 
        } else if (response.status === 400) {
          showSnack("warning", "A server error has occurred.");
        }
      })
      .catch(e => {
        console.log(e);
        showSnack("warning", "A server error has occurred.");
      });
  };

  const deleteNote = (id: string) => {
    NoteService.remove(id)
      .then(response => {
        if (response.status === 200) {
          retrieveNotes(); // update the notes
          setDialogOpen(false); // close the dialog
          showSnack("error", "Note deleted!");
        } else if (response.status === 400) {
          showSnack("warning", "A server error has occurred.");
        }
      })
      .catch(e => {
        console.log(e);
        showSnack("warning", "A server error has occurred.");
      })
  };

  let [editDialogOpen, setEditDialogOpen] = useState(false);

  // Helper function to pass to viewnote to open the edit dialog
  const openEditNote = () => {
    setEditDialogOpen(true);
  };

  const editNote = (id: string, title: string, body: string, color: string) => {
    if (title.trim().length === 0 || body.trim().length === 0) {
      return; // no need to continue
    }

    let data = {
      title: title,
      body: body,
      color: color
    }
    NoteService.update(id, data)
      .then(response => {
        if (response.status === 200) {
          retrieveNotes(); // update list of notes
          setDialogNote(response.data); // update the note we show in the ViewNote dialog
          setEditDialogOpen(false); // close dialog
          showSnack("info", "Note edited."); // show snackbar
        } else if (response.status === 400) {
          showSnack("warning", "A server error has occurred.");
        }
      })
      .catch(e => {
        console.log(e);
        showSnack("warning", "A server error has occurred.");
      })
  }; 

  // Function to set the snackbar contents and show it
  const showSnack = (type: AlertColor, message: string) => {
    setSnackType(type);
    setSnackText(message);
    setSnackOpen(true);
  };

  // Alert snackbar
  let [snackType, setSnackType] = useState<AlertColor>("info");
  let [snackText, setSnackText] = useState('');
  let [snackOpen, setSnackOpen] = useState(false);
  const snackbar = (
    <Snackbar open={snackOpen} autoHideDuration={3000} onClose={() => setSnackOpen(false)}>
      <Alert onClose={() => setSnackOpen(false)} severity={snackType}>
        {snackText}
      </Alert>
    </Snackbar>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6">
              Note-taking App
            </Typography>
          </Toolbar>
        </AppBar>
        <NewNote saveNewNote={saveNewNote} />
        <ListNotes savedNotes={notes} openNote={openNote} />
        <ViewNote open={dialogOpen} setOpen={setDialogOpen} note={dialogNote} deleteNote={deleteNote} openEditNote={openEditNote}/>
        <EditNote open={editDialogOpen} setOpen={setEditDialogOpen} note={dialogNote} editNote={editNote}/>
        {snackbar}
      </div>
    </ThemeProvider>
  );
}

// Component that has a textarea box to write a note and an "Add Note" button
function NewNote({saveNewNote}: SaveNoteProps) {
  let [title, setTitle] = useState("");
  let [body, setBody] = useState("");
  let [color, setColor] = useState(DEFAULT_COLOR);

  // Error display
  let [titleError, setTitleError] = useState(false);
  let [bodyError, setBodyError] = useState(false);
  let [bodyErrText, setBodyErrText] = useState('');

  const toggleBodyError = (state: boolean) => {
    if (state === false) {
      setBodyError(false);
      setBodyErrText("");
    } else {
      setBodyError(true);
      setBodyErrText("Your note's body cannot be empty!");
    }
  };

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex)
  }

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Grid container justifyContent="center" flexDirection="column" spacing={2} marginTop={2}>
        <Typography variant="h6">Write a New Note</Typography>
        <Grid container item xs={12} marginTop={-2}>
          <Grid item xs={0.5} sm={2} md={3}/>
          <Grid item xs={11} sm={8} md={6}>
            <Box marginTop={2} marginBottom={2} sx={{ display:"flex", justifyContent:"space-evenly" }} >
              <CirclePicker color={color} onChangeComplete={handleColorChange} colors={COLORS} width="auto" />
            </Box>
            <TextField
              label="Note Title"
              fullWidth={true}
              margin="dense"
              onChange={(event) => {
                let val = event.target.value;
                setTitle(val);
                if (val.trim().length === 0) {
                  setTitleError(true);
                } else {
                  setTitleError(false);
                }
              }}
              value={title}
              inputProps= {{ maxLength: TITLE_LENGTH }}
              helperText= {(TITLE_LENGTH - title.length) + " characters remaining"}
              error={titleError}
            />
            <TextField 
              multiline={true}
              fullWidth={true}
              minRows={4}
              onChange={(event) => {
                let val = event.target.value;
                setBody(val);
                if (val.trim().length === 0) {
                  toggleBodyError(true);
                } else {
                  toggleBodyError(false);
                }
              }}
              value={body}
              margin="dense"
              label="Write here..."
              error={bodyError}
              helperText={bodyErrText}
            />
          </Grid>
          <Grid item xs={0.5} sm={2} md={3}/>
        </Grid>
        <Grid container item xs={12} marginTop={-1}>
          <Grid item xs={0.5} sm={2} md={3}/>
          <Grid item xs={11} sm={8} md={6}>
            <Button variant="contained" color="success" onClick={async () => {
                const result = await saveNewNote(title, body, color);
                if (result) {
                  setTitle("");
                  setBody("");
                  setColor(DEFAULT_COLOR);

                  // Clear all errors
                  setTitleError(false);
                  toggleBodyError(false);
                } else {
                  if (title.trim().length === 0) {
                    setTitleError(true);
                  } else {
                    setTitleError(false);
                  }

                  if (body.trim().length === 0) {
                    toggleBodyError(true);
                  } else {
                    toggleBodyError(false);
                  }
                }
              }} fullWidth={true} style={{ backgroundColor: color }}>
              Save Note
            </Button>
          </Grid>
          <Grid item xs={0.5} sm={2} md={3}/>
        </Grid>
      </Grid>
    </form>
  );
}

// Component that lists all of the notes currently saved by the user and with links to view the notes
function ListNotes({savedNotes, openNote}: ListNotesProps) {
  const noteButtons = savedNotes.map((note) =>
    <li key={note.id} style={{marginBottom: "8px"}}>
      <Button 
        variant="outlined" 
        sx={{
          textTransform: "none", wordBreak: "break-all", color: note.color, borderColor: note.color, 
          '&:hover': {bgcolor: (note.color + "00"), borderColor: (note.color + "88")}}} 
        fullWidth={true}
        size="large"
        onClick={() => openNote(note.id)}>
          {note.title}
        </Button>
    </li>
  );

  return (
    <Grid container justifyContent="center" flexDirection="column" spacing={2} marginTop={2}>
      <Typography variant="h6">Saved Notes:</Typography>
      <Grid container item xs={12} marginTop={-2}>
        <Grid item xs={0.5} sm={2} md={3} />
        <Grid item xs={11} sm={8} md={6}><ul className="noteList">{noteButtons}</ul></Grid>
        <Grid item xs={0.5} sm={2} md={3} />
      </Grid>
    </Grid>
  );
}

// Component that will retrieve details of a specific note and show it to the user in a model
function ViewNote({open, setOpen, note, deleteNote, openEditNote}: ViewNoteProps) {

  const formatDate = (date: string) => {
    let dateParsed = new Date(date);
    return dateParsed.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="note-title"
        aria-describedby="note-body"
        fullWidth={true}>
        <DialogTitle display="flex"
          justifyContent="space-between" 
          id="note-title"
          color={note.color}
          sx={{ padding: "16px", wordBreak: "break-all" }}>
          {note.title}
          <IconButton sx={{marginTop: "-4px"}} onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant='subtitle2' color={note.color} marginBottom={1}>
            Last Modified: {formatDate(note.updated)}
          </Typography>
          <DialogContentText id="note-body" color={note.color} sx={{whiteSpace: "pre-line", wordBreak: "break-all"}}>
            {note.body}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={() => deleteNote(note.id)}>Delete</Button>
          <Button color="secondary" onClick={openEditNote}>Edit</Button>
          <Button color="primary" onClick={() => setOpen(false)} autoFocus>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

// Component that contains a modal that allows you to edit a note
function EditNote({open, setOpen, note, editNote}: EditNoteProps) {
  let [title, setTitle] = useState("");
  let [body, setBody] = useState("");
  let [color, setColor] = useState(DEFAULT_COLOR);

  // Error variables
  let [titleError, setTitleError] = useState(false);
  let [bodyError, setBodyError] = useState(false);
  let [bodyErrText, setBodyErrText] = useState("");

  const toggleBodyError = (state: boolean) => {
    if (state === false) {
      setBodyError(false);
      setBodyErrText("");
    } else {
      setBodyError(true);
      setBodyErrText("Your note's body cannot be empty!");
    }
  };

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex)
  }

  // Listens for open to change to set some variables passed from the parent
  useEffect(() => {
    if (open) {
      setTitle(note.title);
      setBody(note.body);
      setColor(note.color);

      // Turn off any previous error states
      setTitleError(false);
      toggleBodyError(false);
    }
  }, [open, note]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth={true}>
          <DialogTitle display="flex"
          justifyContent="space-between" 
          id="note-title"
          sx={{ padding: "16px" }}>
            Editing Note
            <IconButton sx={{marginTop: "-4px"}} onClick={() => setOpen(false)}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box marginTop={2} marginBottom={2} sx={{ display:"flex", justifyContent:"space-evenly" }} >
              <CirclePicker color={color} onChangeComplete={handleColorChange} colors={COLORS} width="auto" />
            </Box>
            <TextField
                label="Note Title"
                fullWidth={true}
                margin="normal"
                onChange={(event) => {
                  let val = event.target.value;
                  setTitle(val);
                  if (val.trim().length === 0) {
                    setTitleError(true);
                  } else {
                    setTitleError(false);
                  }
                }}
                value={title}
                inputProps= {{ maxLength: TITLE_LENGTH }}
                helperText= {(TITLE_LENGTH - title.length) + " characters remaining"}
                error={titleError}
            />
            <TextField 
                multiline={true}
                fullWidth={true}
                minRows={4}
                onChange={(event) => {
                  let val = event.target.value;
                  setBody(val);
                  if (val.trim().length === 0) {
                    toggleBodyError(true);
                  } else {
                    toggleBodyError(false);
                  }
                }}
                value={body}
                margin="normal"
                label="Write here..."
                error={bodyError}
                helperText={bodyErrText}
            />
          </DialogContent>
          <DialogActions>
            <Button color="primary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="success" sx={{ color: color }} onClick={() => editNote(note.id, title, body, color)}>Save</Button>
          </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;

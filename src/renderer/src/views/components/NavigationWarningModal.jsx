
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography 
  } from '@mui/material'
  
  export default function NavigationWarningModal({ open, onClose, onConfirm }) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Stop Data Capture?</DialogTitle>
        <DialogContent>
          <Typography>
            Navigating away will stop the current data capture session. 
            Are you sure you want to proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Stay Here
          </Button>
          <Button onClick={onConfirm} color="error">
            Stop and Navigate
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
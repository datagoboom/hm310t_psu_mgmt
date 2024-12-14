import { Box, Typography, Grid } from '@mui/material'
import ErrorIcon from '@mui/icons-material/Error'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

export default function StatusIndicator({ measurements, state }) {
  if (!measurements || !state) return null

  const ProtectionStatus = ({ name, active }) => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1,
      color: active ? 'error.main' : 'success.main'
    }}>
      {active ? <ErrorIcon /> : <CheckCircleIcon />}
      <Typography>{name}: {active ? 'Triggered' : 'Normal'}</Typography>
    </Box>
  )

  const CurrentValue = ({ label, value, unit }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h4">
        {typeof value === 'number' ? value.toFixed(3) : value} {unit}
      </Typography>
    </Box>
  )

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Status
      </Typography>

      <Box sx={{ mb: 3 }}>
        <CurrentValue label="Voltage" value={measurements.voltage} unit="V" />
        <CurrentValue label="Current" value={measurements.current} unit="A" />
        <CurrentValue label="Power" value={measurements.power} unit="W" />
      </Box>

      <Typography variant="h6" gutterBottom>
        Output
      </Typography>
      <Box sx={{ mb: 3, color: state.outputEnabled ? 'success.main' : 'error.main' }}>
        {state.outputEnabled ? <CheckCircleIcon /> : <ErrorIcon />}
        <Typography component="span" sx={{ ml: 1 }}>
          {state.outputEnabled ? 'Enabled' : 'Disabled'}
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom>
        Protection Status
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ProtectionStatus name="OVP" active={state.protectionStatus?.OVP} />
        </Grid>
        <Grid item xs={12}>
          <ProtectionStatus name="OCP" active={state.protectionStatus?.OCP} />
        </Grid>
        <Grid item xs={12}>
          <ProtectionStatus name="OPP" active={state.protectionStatus?.OPP} />
        </Grid>
        <Grid item xs={12}>
          <ProtectionStatus name="OTP" active={state.protectionStatus?.OTP} />
        </Grid>
        <Grid item xs={12}>
          <ProtectionStatus name="SCP" active={state.protectionStatus?.SCP} />
        </Grid>
      </Grid>
    </Box>
  )
} 
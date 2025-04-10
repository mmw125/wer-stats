import React from 'react';
import './App.css';
import { ManualGameScore, Schedule } from './Schedule';
import { Standings } from './Standings';

export default function App() {
  const [manualScores, setManualScores] = React.useState<ManualGameScore[]>([]);
  return (
    <>
      <h1>Current Standings</h1>
      <Standings manualScores={manualScores} />
      <h1>Schedule</h1>
      * Checkbox represents Try Bonus Point
      <Schedule modifyStandings={setManualScores} />
    </>
  )
}

import 'bootstrap/dist/css/bootstrap.min.css';

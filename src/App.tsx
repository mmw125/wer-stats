import './App.css';
import { Schedule } from './Schedule';
import { Standings } from './Standings';

export default function App() {

  return (
    <>
      <h1>Current Standings</h1>
      <Standings />
      <h1>Schedule</h1>
      <Schedule />
    </>
  )
}

import 'bootstrap/dist/css/bootstrap.min.css';

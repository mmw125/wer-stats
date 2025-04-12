import { default as standings } from './assets/standings.json'
import Table from "react-bootstrap/Table"
import { ManualGameScore } from './Schedule';
import { useEffect, useState } from 'react';

type StandingsHeaders = keyof typeof standings;
type Row = keyof typeof standings["TEAM"]

type Score = { [K in Exclude<StandingsHeaders, "TEAM">]: number } & { "TEAM": string };

type Scores = {
    [K in string]: Score
}

function buildScore(row: Row): Score {
    return {
        TEAM: standings.TEAM[row], GP: standings.GP[row], W: standings.W[row], L: standings.L[row], "BP*": standings['BP*'][row], "POINTS**": standings['POINTS**'][row], "Road Wins": standings["Road Wins"][row], "+/-": standings["+/-"][row]
    }
}

const headers: Array<StandingsHeaders> = ["TEAM", "GP", "W", "L", "+/-", "Road Wins", "BP*", "POINTS**"];
const rows: Array<Row> = Object.keys(standings["TEAM"]) as Array<keyof typeof standings["TEAM"]>;


export function Standings({ manualScores }: { manualScores: ManualGameScore[] }) {
    const [scores, setScores] = useState<Scores>({});

    useEffect(() => {
        const newScores: Scores = {};

        rows.forEach(row => {
            const score = buildScore(row)
            newScores[score.TEAM] = score;
        })


        manualScores.forEach(score => {
            if (score.happened === true || score.homeScore === score.awayScore) {
                return;
            }
            const home = newScores[score.homeTeam];
            const away = newScores[score.awayTeam];

            home['GP'] += 1;
            away['GP'] += 1;
            home['+/-'] += score.homeScore - score.awayScore;
            away['+/-'] += score.awayScore - score.homeScore;

            if (score.homeTryPoint) {
                home['BP*'] += 1;
                home['POINTS**'] += 1;
            }
            if (score.awayTryPoint) {
                away['BP*'] += 1;
                away['POINTS**'] += 1;
            }

            const diff = Math.abs(score.homeScore - score.awayScore);
            if (score.homeScore > score.awayScore) {
                home.W += 1;
                home['POINTS**'] += 4;
                away.L += 1;
                if (diff <= 7) {
                    away['BP*'] += 1
                    away['POINTS**'] += 1
                }
            } else {
                home.L += 1;
                away['Road Wins'] += 1;
                away.W += 1;
                if (diff <= 7) {
                    home['BP*'] += 1
                    home['POINTS**'] += 1;
                }
                away['POINTS**'] += 4;

            }

        })
        // console.log(newModifiers); 
        setScores(newScores);
    }, [manualScores, setScores])

    return (
        <div>
            <Table id="standings" striped bordered responsive>
                <thead>
                    <tr>
                        {headers.map(key => (<th>{key}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => <StandingRow key={row} row={row} scores={scores} />)}
                </tbody>
            </Table>
        </div>
    );
}

function StandingRow({ row, scores }: { row: keyof typeof standings["TEAM"], scores: Scores }) {
    const teamName = standings.TEAM[row];
    const score = scores[teamName] ?? buildScore(row);
    return (
        <tr key={row}>
            {headers.map(header => {
                return (
                    <td>
                        {score[header]}
                    </td>);
            })}
        </tr>
    )
}

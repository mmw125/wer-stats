import { default as standings } from './assets/standings.json'
import Table from "react-bootstrap/Table"
import { ManualGameScore } from './Schedule';
import { useEffect, useState } from 'react';

type StandingsHeaders = keyof typeof standings;
type Row = keyof typeof standings["TEAM"]

type Score = { [K in Exclude<StandingsHeaders, "TEAM" | "COLOR">]: number } & { "TEAM": string } & { "COLOR": string };

type Scores = {
    [K in string]: Score
}

function buildScore(row: Row): Score {
    return {
        TEAM: standings.TEAM[row], GP: standings.GP[row], W: standings.W[row], L: standings.L[row], "BP*": standings['BP*'][row], "POINTS**": standings['POINTS**'][row], "Road Wins": standings["Road Wins"][row], "+/-": standings["+/-"][row], COLOR: standings["COLOR"][row]
    }
}

const headers: Array<StandingsHeaders> = ["TEAM", "GP", "W", "L", "+/-", "Road Wins", "BP*", "POINTS**"];
const rows: Array<Row> = Object.keys(standings["TEAM"]) as Array<keyof typeof standings["TEAM"]>;


export function Standings({ manualScores }: { manualScores: ManualGameScore[] }) {
    const [sortedScores, setSortedScores] = useState<Score[]>([]);

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

        const scoresList = [...Object.values(newScores)];
        scoresList.sort((a, b) => {
            if (a['POINTS**'] != b['POINTS**']) {
                return b['POINTS**'] - a['POINTS**']
            }
            if (a['BP*'] != b['BP*']) {
                return b['BP*'] - a['BP*']
            }
            return b['Road Wins'] - a['Road Wins']
        })
        setSortedScores(scoresList);

    }, [manualScores, setSortedScores])

    return (
        <div>
            <Table id="standings" striped bordered responsive>
                <thead>
                    <tr>
                        {headers.map(key => (<th key={key}>{key}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {sortedScores.map(score => <StandingRow key={score.TEAM} score={score} />)}
                </tbody>
            </Table>
        </div>
    );
}

function StandingRow({ score }: { score: Score }) {
    return (
        <tr >
            {headers.map(header => {
                return (
                    <td style={header == "TEAM" ? { backgroundColor: score.COLOR } : {}}>
                        {score[header]}
                    </td>);
            })}
        </tr>
    )
}

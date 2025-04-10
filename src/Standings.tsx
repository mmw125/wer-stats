import { default as standings } from './assets/standings.json'
import Table from "react-bootstrap/Table"
import { ManualGameScore } from './Schedule';
import { useEffect, useState } from 'react';

type StandingsHeaders = keyof typeof standings

type Modifier = { [K in Exclude<StandingsHeaders, "TEAM">]: number };

function buildModifier(): Modifier {
    return {
        GP: 0, W: 0, L: 0, "BP*": 0, "POINTS**": 0, "Road Wins": 0, "+/-": 0
    }
}

const headers: Array<StandingsHeaders> = ["TEAM", "GP", "W", "L", "+/-", "Road Wins", "BP*", "POINTS**"];
const rows: Array<keyof typeof standings["TEAM"]> = Object.keys(standings["TEAM"]) as Array<keyof typeof standings["TEAM"]>;


export function Standings({ manualScores }: { manualScores: ManualGameScore[] }) {
    const [modifiers, setModifiers] = useState<{ [K in string]: Modifier }>({});

    useEffect(() => {
        const newModifiers: {[K in string]: Modifier} = { };

        manualScores.forEach(score => {
            if (score.homeTeam === "" || score.homeScore === score.awayScore) {
                return;
            }
            const home = newModifiers[score.homeTeam] ?? buildModifier();
            const away = newModifiers[score.homeTeam] ?? buildModifier();

            home['GP'] += 1;
            away['GP'] += 1;
            home['+/-'] += score.homeScore - score.awayScore;
            away['+/-'] += score.awayScore - score.homeScore;
            home['BP*'] += score.homeTryPoint ? 1 : 0;
            away['BP*']+= score.awayTryPoint ? 1 : 0;

            const diff = Math.abs(score.homeScore - score.awayScore);
            if (score.homeScore > score.awayScore) {
                home.W += 1;
                home['POINTS**'] += 4;
                away.L += 1;
                if (diff <= 7) {
                    away['BP*'] += 1
                }
            } else {
                home.L += 1;
                away['Road Wins'] += 1;
                away.W += 1;
                if (diff <= 7) {
                    home['BP*'] += 1
                }
                away['POINTS**'] += 4;

            }

            home['POINTS**'] += home['BP*'];
            away['POINTS**'] += away['BP*'];

            newModifiers[score.homeTeam] = home;
            newModifiers[score.awayTeam] = away;

        })
        // console.log(newModifiers); 
        setModifiers(newModifiers);
    }, [manualScores, setModifiers])

    return (
        <div>
            <Table id="standings" striped bordered responsive>
                <thead>
                    <tr>
                        {headers.map(key => (<th>{key}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => <StandingRow key={row} row={row} modifiers={modifiers}/>)}
                </tbody>
            </Table>
        </div>
    );
}

function StandingRow({row, modifiers}: {row: keyof typeof standings["TEAM"], modifiers: { [K in string]: Modifier }}) {
    const teamName = standings.TEAM[row];
    const modifier = modifiers[teamName] ?? buildModifier();
    return (
        <tr key={row}>
            {headers.map(header => {
                if (header === "TEAM") {
                    return (
                        <td>
                            {standings[header][row]}
                        </td>);
                }
                return (
                    <td>
                        {parseInt(standings[header][row] as any) + modifier[header]}
                    </td>
                )
            })}
        </tr>
    )
}

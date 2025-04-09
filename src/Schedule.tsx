import { FormControl, InputGroup, Table } from "react-bootstrap";
import { default as schedule } from "./assets/schedule.json"
import React from "react";

type ScheduleHeader = keyof typeof schedule
type ScheduleRow = keyof typeof schedule["DATE"]

const headerTranslation: Map<ScheduleHeader, string> = new Map([["SCORE.1", "SCORE"]])
const headers: Array<ScheduleHeader> = ["DATE", "HOME", "SCORE", "AWAY", "SCORE.1"];

export interface ScheduleProps {
    modifyStandings: (manualScores: ManualGameScore[]) => void;
}

export interface ManualGameScore {
    homeTeam: string;
    homeScore: number;
    homeTryPoint: boolean;

    awayTeam: string;
    awayScore: number;
    awayTryPoint: boolean;
}

function buildManualGameScore(): ManualGameScore {
    return {
        homeTeam: "",
        homeScore: 0,
        homeTryPoint: false,
        awayTeam: "",
        awayScore: 0,
        awayTryPoint: false,
    }
}

export function Schedule({ modifyStandings }: ScheduleProps) {
    const rows: Array<ScheduleRow> = Object.keys(schedule["DATE"]) as Array<ScheduleRow>;

    const [manualScores, setManualScores] = React.useState<ManualGameScore[]>([]);

    React.useEffect(() => {
        const scores = [];
        for (let i = 0; i < Object.keys(schedule.AWAY).length; i += 1) {
            scores.push(buildManualGameScore());
        }
        setManualScores(scores);
        modifyStandings(scores);
    }, [setManualScores])

    return (
        <Table id="standings" striped bordered responsive>
            <thead>
                <tr key={"header"}>
                    {headers.map(key => (<th>{headerTranslation.get(key) ?? key}</th>))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, i) => <GameDisplay key={row+"key"} row={row} setManualScore={(manualScore) => {
                    const newScores = [...manualScores];
                    newScores[i] = manualScore;
                    setManualScores(newScores);
                    modifyStandings(newScores.filter(score => score.homeTeam != ""));
                }} />)}
            </tbody>
        </Table>
    );
}

export function GameDisplay({ row, setManualScore }: { row: ScheduleRow, setManualScore: (manualScore: ManualGameScore) => void }) {
    const canChange = schedule.SCORE[row] === "-";

    const [game, setGame] = React.useState<ManualGameScore>({
        homeTeam: schedule["HOME"][row],
        homeScore: canChange ? 0 : parseInt(schedule["SCORE"][row]),
        homeTryPoint: false,

        awayTeam: schedule["AWAY"][row],
        awayScore: canChange ? 0 : parseInt(schedule["SCORE.1"][row]),
        awayTryPoint: false
    });

    const buildForm = (header: ScheduleHeader) => {
        const onFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            const gameCopy = {
                ...game
            }
            if (header === "SCORE") {
                gameCopy.homeScore = parseInt(newValue);
            } else if (header === "SCORE.1") {
                gameCopy.awayScore = parseInt(newValue);
            }
            setGame(gameCopy);
            setManualScore(gameCopy)
        };

        const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.checked;
            const gameCopy = {
                ...game
            }
            if (header === "SCORE") {
                gameCopy.homeTryPoint = newValue;
            } else if (header === "SCORE.1") {
                gameCopy.awayTryPoint = newValue;
            }
            setGame(gameCopy);
            setManualScore(gameCopy)
        };
        return <InputGroup><FormControl type="number" width={"20px"} id="inputGroup-sizing-sm" onChange={onFormChange} /><InputGroup.Checkbox onChange={onCheckboxChange} /></InputGroup>
    }

    const hasWinner = game.homeScore != game.awayScore;
    const homeWins = game.homeScore > game.awayScore;

    return (
        <tr key={row + "game"}>
            {headers.map(header => {
                if (header === "SCORE") {
                    return (<td>{canChange ? buildForm(header) : schedule[header][row]}</td>)
                } else if (header === "SCORE.1") {
                    return (<td>{canChange ? buildForm(header) : schedule[header][row]}</td>)
                }

                if (header === "HOME") {
                    return (<td style={hasWinner ? { backgroundColor: homeWins ? "green" : "red" } : {}}>
                        {schedule[header][row]}
                    </td>)
                } else if (header === "AWAY") {
                    return (<td style={hasWinner ? { backgroundColor: !homeWins ? "green" : "red" } : {}}>
                        {schedule[header][row]}
                    </td>)
                }

                return (<td>
                    {schedule[header][row]}
                </td>)
            }
            )}
        </tr>
    )
}
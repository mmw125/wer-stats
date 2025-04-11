import { FormControl, InputGroup, Table } from "react-bootstrap";
import { default as schedule } from "./assets/schedule.json"
import React from "react";

type ScheduleHeader = keyof typeof schedule
type ScheduleRow = keyof typeof schedule["DATE"]

const headerTranslation: Map<ScheduleHeader, string> = new Map([["SCORE.1", "SCORE"]])
const headers: Array<ScheduleHeader> = ["DATE", "HOME", "SCORE", "AWAY", "SCORE.1"];
const badTeams = ["TC Gemini", "Chicago Tempest"];

export interface ScheduleProps {
    modifyStandings: (manualScores: ManualGameScore[]) => void;
}

export interface ManualGameScore {
    date: string;
    homeTeam: string;
    homeScore: number;
    homeTryPoint: boolean;

    awayTeam: string;
    awayScore: number;
    awayTryPoint: boolean;

    happened: boolean;
}

function buildManualGameScore(row: ScheduleRow): ManualGameScore {
    const happened = schedule["SCORE"][row] !== "-";
    const homeScore = happened ? parseInt(schedule["SCORE"][row]) : badTeams.includes(schedule["AWAY"][row]) ? 30 : 0;
    const homeTryPoint = badTeams.includes(schedule["AWAY"][row]);
    const awayScore = happened ? parseInt(schedule["SCORE"][row]) : badTeams.includes(schedule["HOME"][row]) ? 30 : 0;
    const awayTryPoint = badTeams.includes(schedule["HOME"][row]);

    return {
        date: schedule["DATE"][row],
        homeTeam: schedule["HOME"][row],
        homeScore,
        homeTryPoint,
        awayTeam: schedule["AWAY"][row],
        awayScore,
        awayTryPoint,
        happened
    }
}

export function Schedule({ modifyStandings }: ScheduleProps) {
    const rows: Array<ScheduleRow> = Object.keys(schedule["DATE"]) as Array<ScheduleRow>;

    const [games, setGames] = React.useState<ManualGameScore[]>([]);

    React.useEffect(() => {
        const scores: ManualGameScore[] = [];
        rows.forEach(row => {
            scores.push(buildManualGameScore(row));
        })
        setGames(scores);
        modifyStandings(scores);
    }, [setGames])

    return (
        <Table id="standings" striped bordered responsive>
            <thead>
                <tr key={"header"}>
                    {headers.map(key => (<th>{headerTranslation.get(key) ?? key}</th>))}
                </tr>
            </thead>
            <tbody>
                {games.map((game, i) => <GameDisplay key={game.date + "key"} game={game} setManualScore={(manualScore) => {
                    const newScores = [...games];
                    newScores[i] = manualScore;
                    setGames(newScores);
                    modifyStandings(newScores.filter(score => score.homeTeam != ""));
                }} />)}
            </tbody>
        </Table>
    );
}

export function GameDisplay({ game, setManualScore }: { game: ManualGameScore, setManualScore: (manualScore: ManualGameScore) => void }) {
    const {happened} = game;
    const buildForm = (header: ScheduleHeader) => {
        const onFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            const gameCopy = {
                ...game
            }
            if (header === "SCORE") {
                gameCopy.homeScore = parseInt(newValue ? newValue : "0");
            } else if (header === "SCORE.1") {
                gameCopy.awayScore = parseInt(newValue ? newValue : "0");
            }
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
            setManualScore(gameCopy)
        };
        return (<InputGroup>
            <FormControl type="number" width={"20px"} id="inputGroup-sizing-sm" onChange={onFormChange} defaultValue={header === "SCORE" ? game.homeScore : game.awayScore} />
            <InputGroup.Checkbox onChange={onCheckboxChange} defaultChecked={header === "SCORE" ? game.homeTryPoint : game.awayTryPoint} />
        </InputGroup>)
    }

    const hasWinner = game.homeScore != game.awayScore;
    const homeWins = game.homeScore > game.awayScore;

    return (
        <tr key={game.date + " " + game.homeTeam}>
            {headers.map(header => {
                if (header === "SCORE") {
                    return (<td>{happened ? game.homeScore : buildForm(header)}</td>)
                } else if (header === "SCORE.1") {
                    return (<td>{happened ? game.awayScore : buildForm(header)}</td>)
                }

                if (header === "HOME") {
                    return (<td style={hasWinner ? { backgroundColor: homeWins ? "green" : "red" } : {}}>
                        {game.homeTeam}
                    </td>)
                } else if (header === "AWAY") {
                    return (<td style={hasWinner ? { backgroundColor: !homeWins ? "green" : "red" } : {}}>
                        {game.awayTeam}
                    </td>)
                }

                return (<td>
                    {game.date}
                </td>)
            }
            )}
        </tr>
    )
}

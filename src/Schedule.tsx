import { FormControl, InputGroup, Table, ToggleButton } from "react-bootstrap";
import { default as schedule } from "./assets/schedule.json";
import React, { useState } from "react";

type ScheduleHeader = keyof typeof schedule;
type ScheduleRow = keyof (typeof schedule)["DATE"];

const headerTranslation: Map<ScheduleHeader, string> = new Map([
    ["SCORE.1", "SCORE"],
]);
const headers: Array<ScheduleHeader> = [
    "DATE",
    "HOME",
    "SCORE",
    "AWAY",
    "SCORE.1",
];
const badTeams = [];
// const RED = "#E46464";
const GREEN = "#BAE464"

export interface ScheduleProps {
    modifyStandings: (manualScores: ManualGameScore[]) => void;
}

export interface ManualGameScore {
    id: string;
    date: string;
    homeTeam: string;
    homeScore: number;
    homeTryPoint: boolean;

    awayTeam: string;
    awayScore: number;
    awayTryPoint: boolean;

    happened: boolean;
    locked: boolean;
}

function buildManualGameScore(row: ScheduleRow): ManualGameScore {
    const happened = schedule["SCORE"][row] !== "-";
    const homeScore = happened
        ? parseInt(schedule["SCORE"][row])
        : badTeams.includes(schedule["AWAY"][row])
            ? 30
            : 0;
    const homeTryPoint = badTeams.includes(schedule["AWAY"][row]);
    const awayScore = happened
        ? parseInt(schedule["SCORE.1"][row])
        : badTeams.includes(schedule["HOME"][row])
            ? 30
            : 0;
    const awayTryPoint = badTeams.includes(schedule["HOME"][row]);

    const score: ManualGameScore = {
        date: schedule["DATE"][row],
        homeTeam: schedule["HOME"][row],
        homeScore,
        homeTryPoint,
        awayTeam: schedule["AWAY"][row],
        awayScore,
        awayTryPoint,
        happened,
        locked: happened,
        id: row
    };

    switch (row) {
        case "8":
            score.homeScore = 76;
            score.awayScore = 7;
            score.homeTryPoint = true;
            score.locked = true;
            break;
        case "9":
            score.homeScore = 19;
            score.awayScore = 39;
            score.awayTryPoint = true;
            score.locked = true;
            break;
        case "10":
            score.homeScore = 20;
            score.awayScore = 24;
            score.awayTryPoint = true;
            score.locked = true;
            break;
        case "11":
            score.homeScore = 17;
            score.awayScore = 12;
            score.locked = true;
            break;
        case "12":
            score.homeScore = 0;
            score.awayScore = 41;
            score.awayTryPoint = true;
            score.locked = true;
            break;
        case "24":
            score.homeScore = 5;
            score.awayScore = 30;
            score.awayTryPoint = true;
            break;
        case "29":
            score.homeScore = 5;
            score.awayScore = 30;
            score.awayTryPoint = true;
            break;
    }
    return score;
}

export function Schedule({ modifyStandings }: ScheduleProps) {
    const rows: Array<ScheduleRow> = Object.keys(
        schedule["DATE"]
    ) as Array<ScheduleRow>;

    const [games, setGames] = React.useState<ManualGameScore[]>([]);
    const [hidePlayedGames, setHidePlayedGames] = useState(false);
    const buildGame = (game: ManualGameScore, i: number) => {
        return (
            <GameDisplay
                key={game.id + "key"}
                game={game}
                hide={hidePlayedGames && game.locked}
                setManualScore={(manualScore) => {
                    const newScores = [...games];
                    newScores[i] = manualScore;
                    setGames(newScores);
                    modifyStandings(
                        newScores.filter((score) => score.homeTeam != "")
                    );
                }}
            />
        )
    }

    React.useEffect(() => {
        const scores: ManualGameScore[] = [];
        rows.forEach((row) => {
            scores.push(buildManualGameScore(row));
        });
        setGames(scores);
        modifyStandings(scores);
    }, [modifyStandings]);

    return (
        <>
            <Table id="standings" striped bordered responsive>
                <thead>
                    <tr key={"header"}>
                        {headers.map((key) => (
                            <th>{headerTranslation.get(key) ?? key}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {games.map(buildGame)}
                </tbody>
            </Table>
            <ToggleButton
                id="toggle-check"
                type="checkbox"
                variant="primary"
                checked={hidePlayedGames}
                value="1"
                onChange={(e) => setHidePlayedGames(e.currentTarget.checked)}
            >
                Hide Played Games
            </ToggleButton>
            <br /><br />
        </>
    );
}

export function GameDisplay({
    game,
    setManualScore,
    hide
}: {
    game: ManualGameScore;
    setManualScore: (manualScore: ManualGameScore) => void;
    hide?: boolean
}) {
    const { happened, locked } = game;
    const buildForm = (header: ScheduleHeader) => {
        const onFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            const gameCopy = {
                ...game,
            };
            if (header === "SCORE") {
                gameCopy.homeScore = parseInt(newValue ? newValue : "0");
            } else if (header === "SCORE.1") {
                gameCopy.awayScore = parseInt(newValue ? newValue : "0");
            }
            setManualScore(gameCopy);
        };

        const onCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.checked;
            const gameCopy = {
                ...game,
            };
            if (header === "SCORE") {
                gameCopy.homeTryPoint = newValue;
            } else if (header === "SCORE.1") {
                gameCopy.awayTryPoint = newValue;
            }
            setManualScore(gameCopy);
        };

        return (
            <>
                <InputGroup style={{ maxWidth: "100px", minWidth: "50px" }}>
                    <FormControl
                        type="number"
                        style={{ minWidth: "50px" }}
                        id="inputGroup-sizing-sm"
                        onChange={onFormChange}
                        defaultValue={header === "SCORE" ? game.homeScore : game.awayScore}
                    />

                    <InputGroup.Checkbox

                        onChange={onCheckboxChange}
                        defaultChecked={
                            header === "SCORE" ? game.homeTryPoint : game.awayTryPoint
                        }
                    />
                </InputGroup >
            </>
        );
    };

    const hasWinner = game.homeScore != game.awayScore;
    const homeWins = game.homeScore > game.awayScore;

    return (
        <tr key={game.date + " " + game.homeTeam} style={hide ? { display: "none" } : {}}>
            {headers.map((header) => {
                if (header === "SCORE") {
                    return <td>{happened || locked ? game.homeScore : buildForm(header)}</td>;
                } else if (header === "SCORE.1") {
                    return <td>{happened || locked ? game.awayScore : buildForm(header)}</td>;
                }

                if (header === "HOME") {
                    return (
                        <td
                            style={
                                hasWinner && homeWins ? { backgroundColor: GREEN } : {}
                            }
                        >
                            {game.homeTeam}
                        </td>
                    );
                } else if (header === "AWAY") {
                    return (
                        <td
                            style={
                                hasWinner && !homeWins
                                    ? { backgroundColor: GREEN }
                                    : {}
                            }
                        >
                            {game.awayTeam}
                        </td>
                    );
                }

                return <td>{game.date}</td>;
            })}
        </tr>
    );
}

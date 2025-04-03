import { default as standings } from './assets/standings.json'
import Table from "react-bootstrap/table"

export function Standings() {
    const headers: Array<keyof typeof standings> = ["TEAM", "GP", "W", "L", "PF", "PA", "Road Wins", "BP*", "POINTS**"];
    const rows: Array<keyof typeof standings["TEAM"]> = Object.keys(standings["TEAM"]) as Array<keyof typeof standings["TEAM"]>;
    console.log(standings)
    const renderRow = (row: keyof typeof standings["TEAM"]) => {
        return (
            <tr key={row}>
                {headers.map(header => (
                    <td>
                        {standings[header] ? standings[header][row] : "header"}
                    </td>
                ))}
            </tr>
        )
    }

    return (
        <div>
            <Table id="standings" striped bordered responsive >
                <thead>
                    <tr>
                        {headers.map(key => (<th>{key}</th>))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map(row => renderRow(row))}
                </tbody>
            </Table>
        </div>
    );
}
import {Game, toEmoji} from "../data";
import moment from "moment";
import {Badge, Table} from "reactstrap";
import {Link} from "react-router-dom";
import React from "react";
import "./DayTable.css"

function DayGame({game}: { game: Game }) {
    const evt = game.lastUpdate;

    let durationStr = null;
    if (game.end && game.lastUpdate.gameComplete) {
        const startMoment = moment(game.start);
        const endMoment = moment(game.end);
        const diff = endMoment.diff(startMoment);
        durationStr = moment.utc(diff).format("H:mm:ss");
    }

    return (
        <tr>
            <td className="sp-row-score"><Badge className="sp-score-badge" color={"light"}>{evt.awayScore} - {evt.homeScore}</Badge></td>
            <td className="sp-row-away">
                {(evt.awayScore > evt.homeScore) ? (<strong>{evt.awayTeamNickname}</strong>) : (evt.awayTeamNickname)}
            </td>
            <td className="sp-row-vs"><small>vs.</small></td>
            <td className="sp-row-home">
                {(evt.homeScore > evt.awayScore) ? (<strong>{evt.homeTeamNickname}</strong>) : (evt.homeTeamNickname)}
            </td>
            <td className="sp-row-emoji">{toEmoji(evt.awayTeamEmoji)}</td>
            <td className="sp-row-pitcher">{evt.awayPitcherName}</td>
            <td className="sp-row-emoji">{toEmoji(evt.homeTeamEmoji)}</td>
            <td className="sp-row-pitcher">{evt.homePitcherName}</td>
            <td className="sp-row-duration">{durationStr ?? (<strong>LIVE</strong>)}</td>
            <td className="sp-row-link"><Link to={`/game/${game.id}`}>View</Link></td>
        </tr>
    )
}

export function DayTable({games, season, day}: { games: Game[], season: number, day: number }) {
    return (
        <p>
            <h3>Season <strong>{season}</strong>, Day <strong>{day}</strong></h3>

            <Table size="sm" hover>
                <thead>
                <tr>
                    <th className="sp-row-score">Score</th>
                    <th colSpan={3} className="sp-row-vs">Teams</th>
                    <th/>
                    <th>Away Batter</th>
                    <th/>
                    <th>Home Batter</th>
                    <th>Length</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {games.map(game => <DayGame key={game.id} game={game}/>)}
                </tbody>
            </Table>
        </p>
    )
}
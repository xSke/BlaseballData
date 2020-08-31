import React from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router';
import moment from 'moment';
import { Table } from "reactstrap";

import './GamePage.css';

import { GameUpdate, GameUpdateWrapper } from "../data/GameUpdate";

function makeDots(count: number, total: number) {
    let out = "";
    for (let i = 0; i < total; i++) {
        out += i < count ? "●" : "○"
    }
    return out.trimEnd();
}

function makeEmoji(emoji: string) {
    return String.fromCodePoint(Number(emoji));
}

function GameUpdateRow({ update }: { update: GameUpdateWrapper }) {
    const momentTimestamp = moment(update.timestamp);

    const evt = update.payload;

    const currentPitcher = evt.topOfInning ? evt.homePitcherName : evt.awayPitcherName;
    let currentBatter = evt.topOfInning ? evt.awayBatterName : evt.homeBatterName;
    if (currentBatter == "")
        currentBatter = null;

    const pitcherEmoji = evt.topOfInning ? evt.homeTeamEmoji : evt.awayTeamEmoji
    const batterEmoji = evt.topOfInning ? evt.awayTeamEmoji : evt.homeTeamEmoji;

    return (<tr>
        <td className="row-time">{momentTimestamp.format("ll LTS")}</td>
        <td className="row-score">{`${makeEmoji(evt.awayTeamEmoji)} ${evt.awayScore} - ${evt.homeScore} ${makeEmoji(evt.homeTeamEmoji)} `}</td>
        <td className="row-inning">{`${evt.inning + 1} ${evt.topOfInning ? "\u25B2" : "\u25BC"}`}</td>
        <td className="row-gamelog">{update.payload.lastUpdate}</td>
        <td className="row-pitcher">{`${makeEmoji(pitcherEmoji)} ${currentPitcher}`}</td>
        <td className="row-batter">{`${currentBatter ? makeEmoji(batterEmoji) : ""} ${currentBatter ?? ""}`}</td>
        <td className="row-balls dots">{makeDots(evt.atBatBalls, 3)}</td>
        <td className="row-strikes dots">{makeDots(evt.atBatStrikes, 2)}</td>
        <td className="row-outs dots">{makeDots(evt.halfInningOuts, 2)}</td>
    </tr>);
}

export function GamePage() {
    const { gameId } = useParams();

    const { data, error } = useSWR<GameUpdateWrapper[]>(`/api/games/${gameId}/events`);

    if (!data) {
        return (<div>Loading...</div>);
    }

    data.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

    const first = data[0].payload;
    return (
        <>
            <h3>Season <strong>{first.season+1}</strong>, Day <strong>{first.day+1}</strong></h3>
            <h4>{makeEmoji(first.awayTeamEmoji)} {first.awayTeamName.replace(first.awayTeamNickname, "")} <strong>{first.awayTeamNickname}</strong> vs. {makeEmoji(first.homeTeamEmoji)} {first.homeTeamName.replace(first.homeTeamNickname, "")} <strong>{first.homeTeamNickname}</strong></h4>
            <br></br>
            <Table striped hover className="events-table">
                <thead>
                    <tr>
                        <th className="row-time">Time</th>
                        <th className="row-score">Score</th>
                        <th className="row-inning">Inn.</th>
                        <th className="row-gamelog">Game Log</th>
                        <th className="row-pitcher">Pitcher</th>
                        <th className="row-batter">Batter</th>
                        <th className="row-balls">Balls</th>
                        <th className="row-strikes">Strk.</th>
                        <th className="row-outs">Outs</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u, i) => (<GameUpdateRow key={i} update={u} />))}
                </tbody>
            </Table>
        </>
    );
}

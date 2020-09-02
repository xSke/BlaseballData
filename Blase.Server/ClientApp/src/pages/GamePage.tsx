import React from 'react';
import useSWR from 'swr';
import { useParams } from 'react-router';
import moment from 'moment';
import {Container, Table} from "reactstrap";

import './GamePage.css';

import {GameUpdateWrapper, toEmoji} from "../data";

function makeDots(count: number, total: number) {
    let out = "";
    for (let i = 0; i < total; i++) {
        out += i < count ? "●" : "○"
    }
    return out.trimEnd();
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
        <td className="gp-row-time">{momentTimestamp.format("ll LTS")}</td>
        <td className="gp-row-score">{`${toEmoji(evt.awayTeamEmoji)} ${evt.awayScore} - ${evt.homeScore} ${toEmoji(evt.homeTeamEmoji)} `}</td>
        <td className="gp-row-inning">{`${evt.inning + 1} ${evt.topOfInning ? "\u25B2" : "\u25BC"}`}</td>
        <td className="gp-row-gamelog">{update.payload.lastUpdate}</td>
        <td className="gp-row-pitcher">{`${toEmoji(pitcherEmoji)} ${currentPitcher}`}</td>
        <td className="gp-row-batter">{`${currentBatter ? toEmoji(batterEmoji) : ""} ${currentBatter ?? ""}`}</td>
        <td className="gp-row-balls gp-dots">{makeDots(evt.atBatBalls, 3)}</td>
        <td className="gp-row-strikes gp-dots">{makeDots(evt.atBatStrikes, 2)}</td>
        <td className="gp-row-outs gp-dots">{makeDots(evt.halfInningOuts, 2)}</td>
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
        <Container fluid={true}>
            <h3>Season <strong>{first.season+1}</strong>, Day <strong>{first.day+1}</strong></h3>
            <h4>{toEmoji(first.awayTeamEmoji)} {first.awayTeamName.replace(first.awayTeamNickname, "")} <strong>{first.awayTeamNickname}</strong> vs. {toEmoji(first.homeTeamEmoji)} {first.homeTeamName.replace(first.homeTeamNickname, "")} <strong>{first.homeTeamNickname}</strong></h4>
            <br></br>
            <Table striped hover className="events-table">
                <thead>
                    <tr>
                        <th className="gp-row-time">Time</th>
                        <th className="gp-row-score">Score</th>
                        <th className="gp-row-inning">Inn.</th>
                        <th className="gp-row-gamelog">Game Log</th>
                        <th className="gp-row-pitcher">Pitcher</th>
                        <th className="gp-row-batter">Batter</th>
                        <th className="gp-row-balls">Balls</th>
                        <th className="gp-row-strikes">Strk.</th>
                        <th className="gp-row-outs">Outs</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((u, i) => (<GameUpdateRow key={i} update={u} />))}
                </tbody>
            </Table>
        </Container>
    );
}

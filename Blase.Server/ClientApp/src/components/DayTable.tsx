import { Game, toEmoji, weather } from "../data";
import moment from "moment";
import { Link } from "react-router-dom";
import React, { ReactNode } from "react";
import "./DayTable.css"
import { Tag, Tooltip, Divider, Space, Row, Col } from "antd";

interface DayTableProps {
    games: Game[];
    season: number;
    day: number;
}

function Score({game}: {game: Game}) {
    return (
        <Tag style={{width: "4em", textAlign: "center"}}>{game.lastUpdate.awayScore} - {game.lastUpdate.homeScore}</Tag>
    )
}

function Bold(props: {bold: boolean, children: ReactNode}) {
    if (props.bold)
        return (<strong>{props.children}</strong>);
    return (<>{props.children}</>);
}


function TeamEmoji(props: {emoji: string}) {
    return <>{toEmoji(props.emoji)}</>
}

function Duration({game}: {game: Game}) {
    if (game.end) {
        const startMoment = moment(game.start);
        const endMoment = moment(game.end);
        const diff = endMoment.diff(startMoment);

        return <>{moment.utc(diff).format("H:mm:ss")}</>;
    }
    return <strong>LIVE</strong>;
}

function Outcomes({outcomes}: {outcomes: string[]}) {

    let elems = [];
    for (const outcomeText of outcomes) {
        if (outcomeText.toLowerCase().indexOf("reverb") > -1)
            elems.push(<Tooltip title={outcomeText}><Tag>{"\u{1F30A}"} Reverb</Tag></Tooltip>);
        if (outcomeText.toLowerCase().indexOf("feedback") > -1)
            elems.push(<Tooltip title={outcomeText}><Tag>{"\u{1F3A4}"} Feedback</Tag></Tooltip>);
        if (outcomeText.toLowerCase().indexOf("umpire") > -1)
            elems.push(<Tooltip title={outcomeText}><Tag>{"\u{1F525}"} Incineration</Tag></Tooltip>);
        if (outcomeText.toLowerCase().indexOf("peanut") > -1)
            elems.push(<Tooltip title={outcomeText}><Tag>{"\u{1F95C}"} Peanut</Tag></Tooltip>);

    }
    return <>{elems}</>;
}

function Weather({game}: {game: Game}) {
    const info = weather[game.lastUpdate.weather];
    if (info) {
        return <Tooltip title={info.name}><span style={{display: "inline-block", width: "2em"}}>{info.emoji}</span></Tooltip>;
    }
    return <>{game.lastUpdate.weather}</>
}

function Item({game}: {game: Game}) {
    return (
        <div>
        <Row>
            <Col xs={24} md={18}>
                <Weather game={game} />
                <Divider type="vertical" />
                <Score game={game} />
                <Divider type="vertical" />
                <Space direction="horizontal">
                    <span style={{display: "inline-block"/*, width: "12em"*/, textAlign: "right"}}>
                        <Bold bold={game.lastUpdate.awayScore > game.lastUpdate.homeScore}>
                            <TeamEmoji emoji={game.lastUpdate.awayTeamEmoji} /> {game.lastUpdate.awayTeamNickname}
                        </Bold>
                    </span>
                    <small>vs.</small>
                    <Bold bold={game.lastUpdate.homeScore > game.lastUpdate.awayScore}>
                        <TeamEmoji emoji={game.lastUpdate.homeTeamEmoji} /> {game.lastUpdate.homeTeamNickname}
                    </Bold>
                </Space>
            </Col>
            <Col xs={24} md={6} style={{textAlign: "right"}}>
            {game.lastUpdate.outcomes ? (<>
                <Outcomes outcomes={game.lastUpdate.outcomes} />
                <Divider type="vertical" />
            </>) : []}
                <Duration game={game} />
             <Divider type="vertical" />
             <Link to={`/games/${game.id}`}>View</Link>
            </Col>
        </Row>
        <Divider type="horizontal" style={{margin: "12px 0"}} />
        </div> 


        // <List.Item>
        //     {/* <List.Item.Meta title={<Title />} /> */}

        //     {game.lastUpdate.outcomes ? (<>
        //         <Outcomes outcomes={game.lastUpdate.outcomes} />
        //         <Divider type="vertical" />
        //     </>) : []}
        //     <Duration game={game} />
        //     <Divider type="vertical" />
        //     <Link to={`/games/${game.id}`}>View</Link>
        // </List.Item>
    );
}

export function DayTable(props: DayTableProps) {
    return (
        <p>
            <h3>Season <strong>{props.season}</strong>, Day <strong>{props.day}</strong></h3>

            {/* <Space align="baseline" direction="vertical"> */}
            <Divider type="horizontal" style={{margin: "12px 0"}} />
                {props.games.map(game => <Item key={game.id} game={game} />)}
            {/* </Space> */}
            {/* <List dataSource={props.games} renderItem={Item} /> */}
        </p>
    )
}
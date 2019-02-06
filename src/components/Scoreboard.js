import React from "react";

const Scoreboard = ({users, selectedScoreboard}) => 
    <div className="scoreboard scoreboard-overall">
        <div className="scoreboard-header">
            <div className="rank"></div>
            <div className="name">Name</div>
            <div className="score">Score</div>
            <div className="overall no-mobile">Rank</div>
        </div>
        {
            users.map((user, i) => {
                let selected = user.ranks[selectedScoreboard] || user.ranks.languages[selectedScoreboard];
                return <div className="scoreboard-item" key={i}>
                    <div className="rank">{i+1}</div>
                    <div className="username">{user.username}</div>
                    <div className="score">{selected.score}</div>
                    <div className="overall no-mobile">{user.ranks.overall.name}</div>
                </div>
            })
        }
        </div>

export default Scoreboard;
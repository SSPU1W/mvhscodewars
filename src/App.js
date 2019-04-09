import React, { Component } from 'react';
import config from "./config";
import { load, addUser } from "./helpers/spreadsheet";
import "./header.css";
import "./App.css";
import Scoreboard from './components/Scoreboard';

class App extends Component {
  constructor(props) {
    super(props);
    // start year = 2018-2019
    // end year up to year x, if month > august, then {x}-{x+1} else {x-1}-{x}
    let date = new Date();
    let startOfFinalYear = date.getFullYear() - 1;
    if (date.getMonth() > 7) {
      startOfFinalYear += 1;
    }

    let yearOptions = [{value: "All Years", label: "All Years"}]
    for (var i = 2018; i <= startOfFinalYear; i++) {
      yearOptions.push({value: i + "-" + i+1, label: i + "-" + (i+1)});
    }
    this.state = {
      adminState: false,
      loggedIn: false,
      passcodeText: "",
      newUserText: "",
      isCurrentStudent: true,
      inputYearValue: "",
      errorCode: "",
      users: [],
      yearOptions: yearOptions,
      selectedScoreboard: "overall",
      selectedOption: "current",
      spreadsheetList: []
    }
  }
  componentDidMount() {
    window.gapi && window.gapi.load("client:auth2", this.initClient);
    //window.gapi && window.gapi.load("auth2", () => {window.gapi.auth2.init({"client_id": config.clientId})});
  }
  render() {
    let {selectedScoreboard, selectedOption, users, spreadsheetList} = this.state;
    // filter and sort by language
    // filter by current year
    if (selectedOption === "current") {
      users = users.filter(user => {
        let found = spreadsheetList.find(listItem => user.username === listItem.userName);
        if (!found) return false;
        return found.isCurrentStudent === "1";
      });
    }

    users = users.filter(user => user.ranks[selectedScoreboard] || user.ranks.languages[selectedScoreboard]).sort((a, b) => {
      var aValue = a.ranks[selectedScoreboard] || a.ranks.languages[selectedScoreboard];
      var bValue = b.ranks[selectedScoreboard] || b.ranks.languages[selectedScoreboard];
      var greater =  aValue.score < bValue.score ? 1 : -1;
      if (aValue.score === bValue.score) {
        return a.username < b.username ? 1 : -1;
      }
      return greater;
    })
    

    return (
      <div className="App">
        {/* Header */}
        <header>
          <div className="title">MVHS Codewars</div>
          <div className="subtitle">Mountain View High School Computer Science</div>
          <div className="teacher">Join the Leaderboard: bit.ly/2SgKowb</div>
        </header>
        <div className="menu-button" onClick={() => this.setState({adminState: true})}>Admin</div>
        {
          this.state.adminState ? <div className="admin-menu">
          <div className="background-view"></div>
            <div className="x-button" onClick={() => this.setState({adminState: false})}>x</div>
            {
               !this.state.loggedIn ? <div className="menu login-menu">
                <label>Passcode</label>
                <input type="text" id="login-field" onChange={(e) => this.setState({passcodeText: e.target.value})} value={this.state.passcodeText}/>
                <div className="login-button" onClick={(e) => this.login(e)}>Login</div>
                <div className="error-code-label">{this.state.errorCode}</div>
               </div>
               :
              <div className="menu user-menu">
                {/* actually add user label */}
                <label>Add User</label>
                <input type="text" id="add-user" onChange={(e) => this.setState({newUserText: e.target.value})} value={this.state.newUserText}/>
                <label>Is Current Student</label>
                <input type="checkbox" checked={this.state.isCurrentStudent} onChange={e => this.setState({isCurrentStudent: e.target.checked})}/>
                <label>Year</label>
                <input type="text" placeholder="YYYY-YYYY" value={this.state.inputYearValue} onChange={e => this.setState({inputYearValue: e.target.value})}/>
                <div className="login-button" onClick={() => this.addUser()}>Add User</div>
                <div className="error-code-label">{this.state.errorCode}</div>
              </div>
            }
          </div> : ""
        }
        
        <div className="scoreboard-container">
          <div className="scoreboard-title">CodeWars Scoreboard</div>
          <div className="scoreboard-tab">
            <div 
              className={selectedScoreboard === "overall" ? "tab-item selected" : "tab-item"} 
              onClick={() => this.setState({selectedScoreboard: "overall"})}
            >Overall</div>
            <div 
              className={selectedScoreboard === "python" ? "tab-item selected" : "tab-item"}
              onClick={() => this.setState({selectedScoreboard: "python"})}
            >Python</div>
            <div 
              className={selectedScoreboard === "c" ? "tab-item selected" : "tab-item"}
              onClick={() => this.setState({selectedScoreboard: "c"})}
            >C</div>
            <div 
              className={selectedScoreboard === "java" ? "tab-item selected" : "tab-item"}
              onClick={() => this.setState({selectedScoreboard: "java"})}
            >Java</div>
          </div>
          <Scoreboard users={users} selectedScoreboard={selectedScoreboard}/>
        </div>
        <div className="options-container">
            <div 
              className={selectedOption === "current" ? "options-item left selected" : "options-item left"}
              onClick={() => this.setState({selectedOption: "current"})}
            >Current students</div>
            <div 
              className={selectedOption === "all time" ? "options-item right selected" : "options-item right"}
              onClick={() => this.setState({selectedOption: "all time"})}
            >All Time</div>
        </div>
      </div>
    );
  }

  login = (e) => {
    if (this.state.passcodeText === "4351") {
      if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) {
        window.gapi.auth2.getAuthInstance().signIn();
      }
      this.setState({loggedIn: true, passcodeText: "", newUserText: "", errorCode: ""});
      return;
    }
    this.setState({
      errorCode: "Incorrect passcode"
    });
  }
  addUser = (e) => {
    if (this.state.inputYearValue.length !== 9 || this.state.inputYearValue.length === 0) {
      this.setState({errorCode: "Incorrect year formatting"});
      return;
    }
    const splitted = this.state.inputYearValue.split("-").map(val => parseInt(val));
    if (splitted.length !== 2) {
      this.setState({errorCode: "Incorrect year formatting"});
      return;
    }
    if (this.state.newUserText.length === 0) {
      this.setState({errorCode: "Input a user name"});
      return;
    }

    if (splitted[0] && splitted[1] && splitted[0] > 1000 && splitted[1] > 1000 && splitted[0] < 10000 && splitted[1] < 10000 && splitted[1] === splitted[0] + 1) {
      this.setState({errorCode: ""});
      addUser({
        user: this.state.newUserText,
        isCurrentStudent: this.state.isCurrentStudent,
        year: this.state.inputYearValue
      }, (response) => {
        this.setState({
          adminState: false
        }, () => {
          load(this.onLoad);
        })
      });
      return;
    }
    this.setState({errorCode: "Incorrect year formatting"});
    return;
  }

  // init for google apps script
  initClient = () => {
    // 2. Initialize the JavaScript client library.
    window.gapi.client
      .init({
        apiKey: config.apiKey,
        clientId: config.clientId,
        // Your API key will be automatically added to the Discovery Document URLs.
        discoveryDocs: config.discoveryDocs,
        scope: "https://www.googleapis.com/auth/spreadsheets"

      })
      .then(() => {
      // 3. Initialize and make the API request.
      load(this.onLoad);
    });
  };
  
  onLoad = (data, error) => {
    if (data) {
      this.fetchCodeWarsUsers(data);
    }
  }

  fetchCodeWarsUsers(userList) {
    let promises = [];
    for (let user of userList) {
      let promise = new Promise((resolve, reject) => {
          fetch("https://cors-anywhere.herokuapp.com/https://www.codewars.com/api/v1/users/" + user.userName).then((res) => res.json()).then((json) => {
          resolve(json);
        })
      })
      promises.push(promise);
    }
    // once everything has been added
    Promise.all(promises).then((users) => {
      // sort users by rank
      users = users.filter((user) => user.username);
      let sorted = users.sort((a,b) => {
        var greater =  a.ranks.overall.score < b.ranks.overall.score ? 1 : -1;
        if (a.ranks.overall.score === b.ranks.overall.score) {
          return a.username < b.username ? 1 : -1;
        }
        return greater;
      })
      this.setState({
        users: sorted,
        spreadsheetList: userList
      })
    })
  }
}

export default App;
